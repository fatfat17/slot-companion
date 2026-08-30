import type { MachineGuide,MachineGuideImage,MachineGuideSectionKey } from "@/types/machineGuide";

export type VisualGuideDisplaySection={
  key:MachineGuideSectionKey;
  title:string;
  summary:string;
  points:string[];
  images:MachineGuideImage[];
};

export function buildVisualGuideDisplaySections(guide:MachineGuide):VisualGuideDisplaySection[]{
  const images=guide.images??[],used=new Set<string>(),sections:VisualGuideDisplaySection[]=[];
  for(const section of guide.playerGuideZh?.sections??[]){
    const sourceKeys=new Set<MachineGuideSectionKey>([section.key,...section.sourceSectionKeys]);
    const owned=images.filter(image=>sourceKeys.has(image.sectionKey)&&!used.has(image.id));
    owned.forEach(image=>used.add(image.id));
    sections.push({key:section.key,title:section.title,summary:section.summary,points:section.points,images:owned});
  }
  for(const section of guide.sections){
    const owned=images.filter(image=>image.sectionKey===section.key&&!used.has(image.id));
    if(!owned.length)continue;
    owned.forEach(image=>used.add(image.id));
    sections.push({key:section.key,title:section.titleZh,summary:"目前尚無可靠中文說明，先查看來源圖解。",points:[],images:owned});
  }
  return sections;
}
