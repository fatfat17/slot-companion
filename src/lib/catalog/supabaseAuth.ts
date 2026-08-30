export function supabaseServerHeaders(key:string,extra:HeadersInit={}):HeadersInit{
  return key.startsWith("sb_secret_")?{apikey:key,...extra}:{apikey:key,Authorization:`Bearer ${key}`,...extra};
}
