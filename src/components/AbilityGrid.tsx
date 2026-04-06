import { Ability } from "../types";
import { 
  PenTool, 
  GraduationCap, 
  Code, 
  Image as ImageIcon, 
  Briefcase, 
  Sparkles 
} from "lucide-react";
import { motion } from "motion/react";

const ABILITIES: Ability[] = [
  {
    id: "writing",
    title: "Writing",
    description: "Emails, stories, essays, and professional rewriting.",
    icon: "PenTool",
    prompt: "I need help with writing. Can you help me write a professional email or a creative story?",
    color: "bg-blue-500",
  },
  {
    id: "learning",
    title: "Learning",
    description: "Clear explanations for science, math, and more.",
    icon: "GraduationCap",
    prompt: "I want to learn something new. Can you explain a complex concept to me in simple terms?",
    color: "bg-green-500",
  },
  {
    id: "coding",
    title: "Coding",
    description: "Debug code, explain logic, and generate snippets.",
    icon: "Code",
    prompt: "I have a coding question. Can you help me debug my code or explain how a specific function works?",
    color: "bg-purple-500",
  },
  {
    id: "image",
    title: "Image Generation",
    description: "Create detailed prompts and generate AI images.",
    icon: "ImageIcon",
    prompt: "A futuristic city with flying cars and neon lights, digital art style.",
    color: "bg-pink-500",
    isImage: true,
  },
  {
    id: "business",
    title: "Business",
    description: "Marketing strategies, planning, and reports.",
    icon: "Briefcase",
    prompt: "I need business advice. Can you help me with a marketing strategy or a business plan?",
    color: "bg-orange-500",
  },
  {
    id: "creative",
    title: "Creative Work",
    description: "Stories, scripts, poems, and game ideas.",
    icon: "Sparkles",
    prompt: "Let's be creative! Can you help me brainstorm ideas for a new story, game, or poem?",
    color: "bg-indigo-500",
  },
];

const IconMap: Record<string, any> = {
  PenTool,
  GraduationCap,
  Code,
  ImageIcon,
  Briefcase,
  Sparkles,
};

interface AbilityGridProps {
  onSelect: (prompt: string, isImage?: boolean) => void;
}

export default function AbilityGrid({ onSelect }: AbilityGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 max-w-5xl mx-auto">
      {ABILITIES.map((ability, index) => {
        const Icon = IconMap[ability.icon];
        return (
          <motion.button
            key={ability.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(ability.prompt, ability.isImage)}
            className="flex flex-col items-start p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all text-left group"
          >
            <div className={ability.color + " p-3 rounded-xl text-white mb-4 group-hover:scale-110 transition-transform"}>
              <Icon size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{ability.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{ability.description}</p>
          </motion.button>
        );
      })}
    </div>
  );
}
