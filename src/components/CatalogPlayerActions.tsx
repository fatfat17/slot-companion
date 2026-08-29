"use client";
import { useEffect,useState } from "react";
import { recordCatalogView,setCatalogFavorite } from "@/lib/playerLibrary";

export function CatalogPlayerActions({catalogId}:{catalogId:string}){
  const[favorite,setFavorite]=useState(false);
  useEffect(()=>{const state=recordCatalogView(catalogId);setFavorite(state.favoriteCatalogIds.includes(catalogId))},[catalogId]);
  function toggle(){const next=setCatalogFavorite(catalogId,!favorite);setFavorite(next.favoriteCatalogIds.includes(catalogId))}
  return <button className={`catalog-favorite-button ${favorite?"active":""}`} aria-pressed={favorite} onClick={toggle}>{favorite?"★ 已收藏":"☆ 收藏機台"}</button>;
}
