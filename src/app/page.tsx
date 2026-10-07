import { Hero } from "@/components/Hero";
import { AboutBlock, Experiments, HowItWorksTeaser, ModelWall, Why } from "@/components/Sections";

export default function Home() {
  return (<><Hero /><div className="pt-20 sm:pt-28"><Why /></div><Experiments /><HowItWorksTeaser /><ModelWall /><AboutBlock /></>);
}
