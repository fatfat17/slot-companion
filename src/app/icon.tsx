import { ImageResponse } from "next/og";
import { AppIconArtwork } from "@/components/AppIconArtwork";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";
export default function Icon() { return new ImageResponse(<AppIconArtwork dimension={size.width}/>,size); }
