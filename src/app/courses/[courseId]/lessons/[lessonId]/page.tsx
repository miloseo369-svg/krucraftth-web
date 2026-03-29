import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (!lesson) notFound();

  const { data: modules } = await supabase
    .from("modules")
    .select("*, lessons(*)")
    .eq("course_id", courseId)
    .order("sequence");

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex flex-col lg:flex-row">
        {/* Video Area */}
        <div className="flex-1">
          <div className="aspect-video bg-black">
            {lesson.bunny_video_path ? (
              <VideoPlayer
                lessonId={lesson.id}
                videoPath={lesson.bunny_video_path}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                วิดีโอยังไม่พร้อม
              </div>
            )}
          </div>
          <div className="p-6">
            <h1 className="text-xl font-bold text-white">{lesson.title}</h1>
          </div>
        </div>

        {/* Sidebar - Lesson List */}
        <div className="w-full lg:w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto max-h-screen">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-sm font-semibold text-gray-300">
              เนื้อหาคอร์ส
            </h2>
          </div>
          {modules?.map((module) => (
            <div key={module.id}>
              <div className="px-4 py-3 bg-gray-750 border-b border-gray-700">
                <h3 className="text-sm font-medium text-gray-400">
                  {module.title}
                </h3>
              </div>
              <ul>
                {module.lessons
                  ?.sort(
                    (a: { sequence: number }, b: { sequence: number }) =>
                      a.sequence - b.sequence
                  )
                  .map((l: { id: string; title: string }) => (
                    <li key={l.id}>
                      <a
                        href={`/courses/${courseId}/lessons/${l.id}`}
                        className={`flex items-center gap-3 px-4 py-3 text-sm transition ${
                          l.id === lessonId
                            ? "bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500"
                            : "text-gray-400 hover:bg-gray-700/50 hover:text-gray-200"
                        }`}
                      >
                        <svg
                          className="w-4 h-4 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                        </svg>
                        {l.title}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
