"use client";
import {useEffect,useState} from "react";
import {recordPachinkoCatalogView,setPachinkoCatalogFavorite} from "@/lib/pachinko/playerLibrary";
export function PachinkoPlayerActions({catalogId}:{catalogId:string}){const[favorite,setFavorite]=useState(false);useEffect(()=>{const state=recordPachinkoCatalogView(catalogId);setFavorite(state.favoriteCatalogIds.includes(catalogId))},[catalogId]);function toggle(){const next=setPachinkoCatalogFavorite(catalogId,!favorite);setFavorite(next.favoriteCatalogIds.includes(catalogId))}return<button className={`catalog-favorite-button ${favorite?"active":""}`} aria-pressed={favorite} onClick={toggle}>{favorite?"★ 已收藏":"☆ 收藏機台"}</button>}
