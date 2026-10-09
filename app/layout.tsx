import type {Metadata,Viewport} from 'next';
import './globals.css';
export const metadata:Metadata={title:'À deux · Notre maison',description:'Les dépenses, les courses et les petits projets. Tout votre quotidien, à deux.',manifest:'/manifest.webmanifest',icons:{icon:'/favicon.svg',apple:'/apple-touch-icon.png'},appleWebApp:{capable:true,statusBarStyle:'default',title:'À deux'}};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#f8f7f2',viewportFit:'cover'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="fr"><body>{children}</body></html>;}
