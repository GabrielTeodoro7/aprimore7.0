import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdminShell } from "@/components/AdminShell";
import { Code2, Shield, Zap, Layers, Share2, Box, Database, FileText, Cpu, Layout, Boxes, ListTree, AlertCircle, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const concepts = [
  {
    title: "1. Classes e Objetos",
    icon: Box,
    desc: "A planta baixa e a construção real. Uma Classe é o molde do Herói, o Objeto é o Herói pronto!",
    snippet: `public class Hero { ... } \nHero batman = new Hero();`,
    color: "bg-blue-100 text-blue-700"
  },
  {
    title: "2. Construtores",
    icon: Zap,
    desc: "O momento do nascimento! Define como o Herói começa sua jornada com nome e poderes.",
    snippet: `public Hero(String name) { this.name = name; }`,
    color: "bg-yellow-100 text-yellow-700"
  },
  {
    title: "3. Encapsulamento",
    icon: Shield,
    desc: "Protegendo a Identidade Secreta! Ninguém mexe nos segredos do Herói sem permissão.",
    snippet: `private String realName; \npublic String getName() { ... }`,
    color: "bg-green-100 text-green-700"
  },
  {
    title: "4. Sobrecarga (Overloading)",
    icon: Layers,
    desc: "Mesma ação, jeitos diferentes! Um soco pode ser fraco ou forte dependendo de como você faz.",
    snippet: `void attack() { ... } \nvoid attack(Weapon w) { ... }`,
    color: "bg-purple-100 text-purple-700"
  },
  {
    title: "5. Sobrescrita (Overriding)",
    icon: Share2,
    desc: "Personalizando habilidades! O herói filho faz a ação do pai de um jeito mais legal.",
    snippet: `@Override \npublic void usePower() { ... }`,
    color: "bg-indigo-100 text-indigo-700"
  },
  {
    title: "6. Herança",
    icon: ListTree,
    desc: "De tal pai, tal filho! O Super-Herói ganha tudo o que o Herói base já tinha.",
    snippet: `public class SuperHero extends Hero { ... }`,
    color: "bg-orange-100 text-orange-700"
  },
  {
    title: "7. Polimorfismo",
    icon: Boxes,
    desc: "Muitas formas! Podemos chamar todos de 'Heróis', mas cada um salva o mundo à sua maneira.",
    snippet: `List<Hero> team = List.of(new Batman(), new Superman());`,
    color: "bg-pink-100 text-pink-700"
  },
  {
    title: "8. Classes Abstratas",
    icon: Code2,
    desc: "O Herói Incompleto! Uma ideia de herói que ainda não pode existir sozinho.",
    snippet: `public abstract class Hero { ... }`,
    color: "bg-slate-100 text-slate-700"
  },
  {
    title: "9. Interfaces",
    icon: Bookmark,
    desc: "O Contrato de Super-Poder! Se você assinar, TEM que saber voar ou nadar.",
    snippet: `public interface Ability { void activate(); }`,
    color: "bg-cyan-100 text-cyan-700"
  },
  {
    title: "10. Coleções do Java",
    icon: Boxes,
    desc: "A Liga da Justiça! Guardando todos os seus heróis organizadinhos em uma lista.",
    snippet: `ArrayList<Hero> team = new ArrayList<>();`,
    color: "bg-emerald-100 text-emerald-700"
  },
  {
    title: "11. Enum em Java",
    icon: ListTree,
    desc: "Categorias Fixas! Escolha se o herói é Iniciante, Vingador ou Nível Deus.",
    snippet: `public enum PowerLevel { GOD, HUMAN }`,
    color: "bg-rose-100 text-rose-700"
  },
  {
    title: "12. Exceções do Java",
    icon: AlertCircle,
    desc: "Ops, algo deu errado! Quando a missão falha, a gente avisa o que aconteceu.",
    snippet: `throw new MissionFailedException("Vilão fugiu!");`,
    color: "bg-red-100 text-red-700"
  },
  {
    title: "13. Java IO & Threads",
    icon: Cpu,
    desc: "Diário Secreto & Multitarefa! Salve histórias em arquivos e faça mil coisas ao mesmo tempo.",
    snippet: `Files.writeString(...) \nclass Mission extends Thread { ... }`,
    color: "bg-teal-100 text-teal-700"
  },
  {
    title: "14. Swing & JDBC",
    icon: Layout,
    desc: "Telas e Memória Eterna! Crie janelas bonitas e salve tudo no Banco de Dados.",
    snippet: `JFrame frame = new JFrame(); \nConnection c = DriverManager.getConnection(...);`,
    color: "bg-violet-100 text-violet-700"
  }
];

export default function GuiaPOO() {
  return (
    <AdminShell title="Guia de Programação POO">
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Guia de Programação POO (Java)</h1>
          <p className="text-muted-foreground">
            Aprenda os segredos do nosso Backend como se fosse uma história de Super-Heróis! 🦸‍♂️💻
          </p>
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 mt-2">
            <p className="text-xs text-emerald-700 font-bold">
              ✅ SISTEMA DE IA ESTÁVEL: Backup fixo configurado (Llama 3.3 70B via Groq) para garantir funcionamento offline e no GitHub.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {concepts.map((c, index) => (
            <Card key={index} className="overflow-hidden border-none shadow-md transition-all hover:shadow-xl">
              <CardHeader className={`${c.color} border-b py-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <c.icon className="h-5 w-5" />
                    <CardTitle className="text-lg">{c.title}</CardTitle>
                  </div>
                  <Badge variant="outline" className="bg-white/50 border-none">Conceito {index + 1}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <CardDescription className="text-sm text-foreground/80 leading-relaxed font-medium">
                  {c.desc}
                </CardDescription>
                <div className="rounded-lg bg-slate-900 p-3">
                  <pre className="text-[11px] font-mono text-slate-300 leading-tight">
                    <code>{c.snippet}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-3 text-primary">
              <Database className="h-6 w-6" />
              <CardTitle>Estrutura do Backend em Java</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">
              Nosso sistema utiliza Java no Backend para garantir segurança (LGPD), performance (Threads) e 
              organização. Cada arquivo na pasta <code>backend-java/src/main/java/escola/tutorial/</code> 
              foi desenhado para ser lido facilmente por estudantes.
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                model/ - Onde ficam os dados
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                dao/ - Onde o banco de dados fala
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                service/ - Onde a lógica acontece
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                tutorial/ - Para aprender POO
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-teal-500" />
                core/ - JDBC, IO, Threads
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                exceptions/ - Gestão de erros
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
