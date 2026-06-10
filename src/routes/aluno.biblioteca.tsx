import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Music, Play, Pause, FastForward, Rewind, Headphones } from "lucide-react";
import { StudentShell } from "@/components/StudentShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/aluno/biblioteca")({
  head: () => ({ meta: [{ title: "Biblioteca de Áudio — Aprimore" }] }),
  component: BibliotecaAudio,
});

const audios = [
  { id: "1", title: "O Pequeno Príncipe", author: "Antoine de Saint-Exupéry", duration: "15:20", emoji: "🤴", category: "Literatura" },
  { id: "2", title: "História do Brasil: O Início", author: "Prof. Alberto", duration: "10:45", emoji: "🇧🇷", category: "História" },
  { id: "3", title: "Sons da Natureza para Focar", author: "Nature Sounds", duration: "30:00", emoji: "🌿", category: "Foco" },
  { id: "4", title: "Aventuras de Alice", author: "Lewis Carroll", duration: "12:30", emoji: "🐰", category: "Literatura" },
];

function BibliotecaAudio() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [progress, setProgress] = useState(35);

  return (
    <StudentShell
      title={
        <span className="flex items-center gap-3">
          <Link to="/aluno" className="rounded-full p-2 hover:bg-accent"><ArrowLeft className="h-6 w-6" /></Link>
          Biblioteca de Áudio
        </span>
      }
      subtitle="Ouça histórias e lições adaptadas para você."
    >
      <div className="grid gap-6">
        {playing && (
          <Card className="p-6 bg-primary/10 border-primary/20 shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-24 w-24 rounded-3xl bg-primary text-white grid place-items-center text-5xl shadow-xl shadow-primary/20">
                {audios.find(a => a.id === playing)?.emoji}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold">{audios.find(a => a.id === playing)?.title}</h3>
                <p className="text-muted-foreground">{audios.find(a => a.id === playing)?.author}</p>
                <div className="mt-4 space-y-2">
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-xs font-bold text-muted-foreground">
                    <span>05:30</span>
                    <span>{audios.find(a => a.id === playing)?.duration}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon"><Rewind /></Button>
                <Button size="icon" className="h-14 w-14 rounded-full shadow-lg" onClick={() => setPlaying(null)}>
                  <Pause className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon"><FastForward /></Button>
              </div>
            </div>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {audios.map(audio => (
            <Card key={audio.id} className="p-4 flex gap-4 items-center hover:shadow-md transition-shadow group">
              <div className="h-16 w-16 rounded-2xl bg-accent grid place-items-center text-3xl group-hover:scale-105 transition-transform">
                {audio.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold truncate">{audio.title}</h4>
                <p className="text-xs text-muted-foreground truncate">{audio.author}</p>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-[10px] font-bold bg-accent px-2 py-0.5 rounded-full">{audio.category}</span>
                   <span className="text-[10px] text-muted-foreground">{audio.duration}</span>
                </div>
              </div>
              <Button size="icon" variant={playing === audio.id ? "secondary" : "ghost"} onClick={() => setPlaying(audio.id)}>
                <Play className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </StudentShell>
  );
}
