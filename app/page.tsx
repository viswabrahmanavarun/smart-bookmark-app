"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Bookmark {
  id: string;
  title: string;
  url: string;
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Get user + listen to auth changes
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Fetch bookmarks
  const fetchBookmarks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMsg(error.message);
    } else if (data) {
      setBookmarks(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setBookmarks([]);
  };

  const handleAddOrUpdate = async () => {
    if (!title || !url) return;

    setButtonLoading(true);
    setErrorMsg("");

    try {
      if (editingId) {
        const { error } = await supabase
          .from("bookmarks")
          .update({ title, url })
          .eq("id", editingId);

        if (error) throw error;

        setEditingId(null);
      } else {
        const { error } = await supabase.from("bookmarks").insert([
          {
            title,
            url,
            user_id: user.id,
          },
        ]);

        if (error) throw error;
      }

      setTitle("");
      setUrl("");
      fetchBookmarks();
    } catch (err: any) {
      setErrorMsg(err.message);
    }

    setButtonLoading(false);
  };

  const handleEdit = (bookmark: Bookmark) => {
    setTitle(bookmark.title);
    setUrl(bookmark.url);
    setEditingId(bookmark.id);
  };

  const deleteBookmark = async (id: string) => {
    setButtonLoading(true);
    await supabase.from("bookmarks").delete().eq("id", id);
    fetchBookmarks();
    setButtonLoading(false);
  };

  // Logged In UI
  if (user) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-xl font-semibold">
              Welcome {user.email}
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>

          {/* Add / Update */}
          <div className="bg-gray-900 p-4 rounded mb-6 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-3 py-2 rounded text-black flex-1"
            />
            <input
              type="text"
              placeholder="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="px-3 py-2 rounded text-black flex-1"
            />
            <button
              onClick={handleAddOrUpdate}
              disabled={buttonLoading || !title || !url}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition disabled:opacity-50"
            >
              {buttonLoading
                ? "Processing..."
                : editingId
                ? "Update"
                : "Add"}
            </button>
          </div>

          {errorMsg && (
            <p className="text-red-400 mb-4">{errorMsg}</p>
          )}

          {/* List */}
          {loading ? (
            <p className="text-gray-400 text-center">Loading...</p>
          ) : (
            <div className="space-y-4">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="flex justify-between items-center bg-gray-800 p-4 rounded"
                >
                  <div>
                    <p className="font-medium">{bookmark.title}</p>
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 text-sm break-all"
                    >
                      {bookmark.url}
                    </a>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(bookmark)}
                      className="px-3 py-1 bg-yellow-500 rounded hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteBookmark(bookmark.id)}
                      className="px-3 py-1 bg-red-500 rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && bookmarks.length === 0 && (
            <p className="text-gray-400 text-center mt-6">
              No bookmarks yet. Add one above.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Not Logged In
  return (
    <div className="h-screen flex items-center justify-center bg-black">
      <button
        onClick={handleLogin}
        className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition"
      >
        Sign in with Google
      </button>
    </div>
  );
}