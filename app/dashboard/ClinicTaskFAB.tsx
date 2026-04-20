"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  StickyNote,
  Bell,
  Send,
  Trash2,
  User,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useTaskStore } from "@/app/store/task-store";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { useBranchStore } from "../store/branch-store";
import { toast } from "sonner";

// 🚀 Gagamitin natin ang stores na ito
import { useUserStore } from "@/app/store/user-stores";
import { useAuthStore } from "../store/useAuthStore";

export function PremiumClinicFAB() {
  const { tasks, fetchTasks, addTask, deleteTask, loading } = useTaskStore();
  const { currentBranchId, branches } = useBranchStore();

  // 1. Kuhanin ang listahan ng users at ang logged-in account
  const { users, fetchUsers } = useUserStore();
  const { user: authAccount } = useAuthStore();

  const [newNote, setNewNote] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 2. Hanapin ang user document na tumutugma sa logged-in account
  const currentUserDoc = useMemo(() => {
    return users.find((u) => u.email === authAccount?.email);
  }, [users, authAccount]);

  // 3. Permission Logic base sa UserStore document
  const isGlobalAdmin =
    currentUserDoc?.role === "superadmin" || currentUserDoc?.role === "owner";
  const hasReminderAccess =
    currentUserDoc?.permissions?.includes("access_reminders");
  const canSeeReminders = isGlobalAdmin || hasReminderAccess;

  useEffect(() => {
    // Siguraduhin na may loaded users tayo
    if (users.length === 0) fetchUsers();
  }, [fetchUsers, users.length]);

  useEffect(() => {
    if (canSeeReminders && currentBranchId) {
      fetchTasks(currentBranchId);
    }
  }, [currentBranchId, fetchTasks, canSeeReminders]);

  // 🛑 Security Check: Kung wala sa UserStore o walang permission, hide FAB
  if (!canSeeReminders) return null;

  const currentBranchName =
    branches.find((b) => b.$id === currentBranchId)?.name || "Select Branch";

  const handleAdd = async () => {
    if (!newNote.trim() || !currentBranchId) return;
    const promise = addTask(newNote, authAccount?.name, currentBranchId);
    toast.promise(promise, {
      loading: "Posting update...",
      success: () => {
        setNewNote("");
        fetchTasks(currentBranchId);
        return "Endorsement posted successfully!";
      },
      error: "Failed to post update.",
    });
  };

  const confirmDelete = async (id: string) => {
    setDeletingId(id);
    const deletePromise = new Promise(async (resolve, reject) => {
      try {
        await deleteTask(id);
        if (currentBranchId) await fetchTasks(currentBranchId);
        resolve(true);
      } catch (e) {
        reject(e);
      } finally {
        setDeletingId(null);
      }
    });

    toast.promise(deletePromise, {
      loading: "Deleting endorsement...",
      success: "Endorsement has been removed.",
      error: "Could not delete endorsement.",
    });
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
      <Sheet>
        <SheetTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ rotate: [0, -1, 1, -1, 1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 8 }}
          >
            <Button className="relative h-16 px-6 rounded-2xl shadow-2xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-3 border-t border-white/20">
              <div className="relative">
                {loading && !tasks.length ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <StickyNote className="h-6 w-6" />
                )}
                {tasks.length > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center bg-red-500 rounded-full text-[10px] font-bold border-2 border-indigo-600 animate-in zoom-in">
                    {tasks.length}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-start leading-tight text-left">
                <span className="font-bold tracking-tight">Reminders</span>
                <span className="text-[10px] opacity-70 uppercase tracking-widest font-medium">
                  {currentBranchName}
                </span>
              </div>
            </Button>
          </motion.div>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-white border-l shadow-2xl flex flex-col p-0 h-dvh"
        >
          <SheetHeader className="p-6 border-b bg-slate-50 shrink-0">
            <SheetTitle className="flex items-center gap-2 text-xl font-black text-indigo-950">
              <Bell className="h-5 w-5 text-indigo-600" /> TEAM ENDORSEMENTS
            </SheetTitle>
          </SheetHeader>

          <div className="p-4 bg-white border-b space-y-3 shrink-0">
            <Textarea
              placeholder="What's the update for the team?"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[100px] border-slate-200 focus:ring-indigo-500 rounded-xl resize-none text-sm"
            />
            <Button
              onClick={handleAdd}
              disabled={loading || !newNote.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2 h-11 font-bold shadow-md shadow-indigo-100 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Post Update
            </Button>
          </div>

          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              <AnimatePresence mode="popLayout">
                {tasks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-slate-400"
                  >
                    <div className="p-4 bg-slate-50 rounded-full mb-3">
                      <StickyNote className="h-10 w-10 opacity-20" />
                    </div>
                    <p className="text-sm italic font-medium">
                      No updates yet for today.
                    </p>
                  </motion.div>
                ) : (
                  tasks.map((task) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        scale: 0.9,
                        transition: { duration: 0.2 },
                      }}
                      key={task.$id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group relative shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                            <User className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800">
                              {task.author || "Member"}
                            </span>
                            <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase">
                              <Clock className="h-2.5 w-2.5" />
                              {formatDistanceToNow(new Date(task.$createdAt), {
                                addSuffix: true,
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed pl-10 wrap-break-word whitespace-pre-wrap font-medium">
                        {task.note}
                      </p>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            disabled={deletingId === task.$id}
                            className="absolute top-4 right-4 p-2 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 transition-all sm:opacity-0 sm:group-hover:opacity-100"
                          >
                            {deletingId === task.$id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl w-[90%] max-w-sm">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Update?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Do you really want to delete this reminder?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => confirmDelete(task.$id)}
                              className="bg-red-600 hover:bg-red-700 rounded-xl"
                            >
                              Yes, Delete.
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
