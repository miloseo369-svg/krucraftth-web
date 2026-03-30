"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showToast } from "@/components/Toast";
import { showConfirm } from "@/components/ConfirmModal";

interface Lesson {
  id: string;
  title: string;
  type: string;
  bunny_video_path: string | null;
  sequence: number;
  is_free_preview: boolean;
}

interface Module {
  id: string;
  title: string;
  sequence: number;
  lessons: Lesson[] | null;
}

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  video: { label: "วิดีโอ", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z", color: "text-indigo-400 bg-indigo-500/10" },
  pdf: { label: "PDF", icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z", color: "text-red-400 bg-red-500/10" },
  quiz: { label: "แบบทดสอบ", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", color: "text-amber-400 bg-amber-500/10" },
  live: { label: "สด", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", color: "text-emerald-400 bg-emerald-500/10" },
};

export default function AdminLessonManager({
  courseId,
  initialModules,
}: {
  courseId: string;
  initialModules: Module[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editModuleId, setEditModuleId] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState("");

  const [showLessonForm, setShowLessonForm] = useState<string | null>(null);
  const [editLessonId, setEditLessonId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonType, setLessonType] = useState("video");
  const [videoPath, setVideoPath] = useState("");
  const [isFreePreview, setIsFreePreview] = useState(false);

  const api = (_: string, method: string, body?: unknown) =>
    fetch(`/api/admin/courses/${courseId}/lessons`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(async (r) => {
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.error);
      }
      return r.json();
    });

  const handleModuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editModuleId) {
        await api("", "PATCH", { type: "module", id: editModuleId, title: moduleTitle });
      } else {
        await api("", "POST", { type: "module", title: moduleTitle, sequence: initialModules.length + 1 });
      }
      setShowModuleForm(false);
      setEditModuleId(null);
      setModuleTitle("");
      router.refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "เกิดข้อผิดพลาด", "error");
    }
    setLoading(false);
  };

  const handleDeleteModule = async (id: string, title: string) => {
    if (!(await showConfirm(`ลบโมดูล "${title}" และบทเรียนทั้งหมดภายใน?`))) return;
    try {
      await api("", "DELETE", { type: "module", id });
      router.refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "ลบไม่สำเร็จ", "error");
    }
  };

  const openLessonForm = (moduleId: string, lesson?: Lesson) => {
    setShowLessonForm(moduleId);
    if (lesson) {
      setEditLessonId(lesson.id);
      setLessonTitle(lesson.title);
      setLessonType(lesson.type);
      setVideoPath(lesson.bunny_video_path ?? "");
      setIsFreePreview(lesson.is_free_preview);
    } else {
      setEditLessonId(null);
      setLessonTitle("");
      setLessonType("video");
      setVideoPath("");
      setIsFreePreview(false);
    }
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editLessonId) {
        await api("", "PATCH", {
          type: "lesson", id: editLessonId, title: lessonTitle,
          lesson_type: lessonType, bunny_video_path: videoPath, is_free_preview: isFreePreview,
        });
      } else {
        const mod = initialModules.find((m) => m.id === showLessonForm);
        await api("", "POST", {
          type: "lesson", module_id: showLessonForm, title: lessonTitle,
          lesson_type: lessonType, bunny_video_path: videoPath,
          sequence: (mod?.lessons?.length ?? 0) + 1, is_free_preview: isFreePreview,
        });
      }
      setShowLessonForm(null);
      router.refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "เกิดข้อผิดพลาด", "error");
    }
    setLoading(false);
  };

  const handleDeleteLesson = async (id: string, title: string) => {
    if (!(await showConfirm(`ลบบทเรียน "${title}"?`))) return;
    try {
      await api("", "DELETE", { type: "lesson", id });
      router.refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "ลบไม่สำเร็จ", "error");
    }
  };

  return (
    <div className="space-y-6">
      {initialModules
        .sort((a, b) => a.sequence - b.sequence)
        .map((mod) => (
          <div key={mod.id} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            {/* Module Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-sm font-bold">
                  {mod.sequence}
                </div>
                <h3 className="font-semibold text-white">{mod.title}</h3>
                <span className="text-xs text-gray-500">
                  {mod.lessons?.length ?? 0} บทเรียน
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openLessonForm(mod.id)}
                  className="px-3 py-1.5 text-xs font-medium text-indigo-400 hover:text-white hover:bg-indigo-600 rounded-lg transition"
                >
                  + บทเรียน
                </button>
                <button
                  onClick={() => { setEditModuleId(mod.id); setModuleTitle(mod.title); setShowModuleForm(true); }}
                  className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition"
                  title="แก้ไข"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteModule(mod.id, mod.title)}
                  className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  title="ลบ"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Lessons */}
            <div>
              {mod.lessons
                ?.sort((a, b) => a.sequence - b.sequence)
                .map((lesson, idx) => {
                  const cfg = TYPE_CONFIG[lesson.type] || TYPE_CONFIG.video;
                  return (
                    <div
                      key={lesson.id}
                      className={`group flex items-center justify-between px-6 py-3.5 hover:bg-gray-800/50 transition ${
                        idx < (mod.lessons?.length ?? 1) - 1 ? "border-b border-gray-800/60" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-600 w-5 text-right">{lesson.sequence}</span>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.color}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cfg.icon} />
                          </svg>
                        </div>
                        <div>
                          <span className="text-sm text-gray-200">{lesson.title}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-500">{cfg.label}</span>
                            {lesson.is_free_preview && (
                              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-medium">
                                FREE
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <Link href={`/instructor/quiz/${courseId}/${lesson.id}`} className="px-2 py-1 text-[10px] font-medium text-purple-400 hover:bg-purple-500/10 rounded-lg transition">Quiz</Link>
                        <button
                          onClick={() => openLessonForm(mod.id, lesson)}
                          className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              {(!mod.lessons || mod.lessons.length === 0) && (
                <div className="px-6 py-8 text-center">
                  <p className="text-sm text-gray-600 mb-3">ยังไม่มีบทเรียนในโมดูลนี้</p>
                  <button
                    onClick={() => openLessonForm(mod.id)}
                    className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    + เพิ่มบทเรียนแรก
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

      {initialModules.length === 0 && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-white font-medium mb-1">เริ่มสร้างเนื้อหา</h3>
          <p className="text-sm text-gray-500 mb-6">เพิ่มโมดูลแรกเพื่อจัดโครงสร้างคอร์ส</p>
          <button
            onClick={() => { setEditModuleId(null); setModuleTitle(""); setShowModuleForm(true); }}
            className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-500 transition"
          >
            + สร้างโมดูลแรก
          </button>
        </div>
      )}

      {/* Add Module */}
      {initialModules.length > 0 && (
        <button
          onClick={() => { setEditModuleId(null); setModuleTitle(""); setShowModuleForm(true); }}
          className="w-full py-4 border border-dashed border-gray-700 rounded-2xl text-sm text-gray-500 hover:border-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/5 transition"
        >
          + เพิ่มโมดูล
        </button>
      )}

      {/* Module Modal */}
      {showModuleForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleModuleSubmit} className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <h2 className="text-lg font-semibold text-white">
              {editModuleId ? "แก้ไขโมดูล" : "เพิ่มโมดูลใหม่"}
            </h2>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">ชื่อโมดูล</label>
              <input
                type="text"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="เช่น บทนำ, พื้นฐาน HTML"
                required
                autoFocus
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowModuleForm(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition">
                ยกเลิก
              </button>
              <button type="submit" disabled={loading} className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition">
                {loading ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleLessonSubmit} className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <h2 className="text-lg font-semibold text-white">
              {editLessonId ? "แก้ไขบทเรียน" : "เพิ่มบทเรียน"}
            </h2>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">ชื่อบทเรียน</label>
              <input
                type="text"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="เช่น HTML คืออะไร?"
                required
                autoFocus
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">ประเภท</label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setLessonType(key)}
                    className={`py-2 rounded-xl text-xs font-medium transition ${
                      lessonType === key
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700"
                    }`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
            {lessonType === "video" && (
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Video Path</label>
                <input
                  type="text"
                  value={videoPath}
                  onChange={(e) => setVideoPath(e.target.value)}
                  placeholder="/videos/intro.mp4"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            )}
            <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-750 transition">
              <input
                type="checkbox"
                checked={isFreePreview}
                onChange={(e) => setIsFreePreview(e.target.checked)}
                className="rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="text-sm text-white">Free Preview</div>
                <div className="text-xs text-gray-500">ผู้เรียนดูบทเรียนนี้ได้ฟรีโดยไม่ต้องลงทะเบียน</div>
              </div>
            </label>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowLessonForm(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition">
                ยกเลิก
              </button>
              <button type="submit" disabled={loading} className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition">
                {loading ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
