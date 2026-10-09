import type {Metadata,Viewport} from 'next';
import '../design-system/tokens/tokens.css';
import '../design-system/components/bundle.css';
import './application.css';
export const metadata:Metadata={title:'Nous deux · Notre maison',description:'Les dépenses, les courses et les petits projets. Tout votre quotidien, à deux.',manifest:'/manifest.webmanifest',icons:{icon:'/favicon.svg',apple:'/apple-touch-icon.png'},appleWebApp:{capable:true,statusBarStyle:'default',title:'Nous deux'}};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#f6f3ef',viewportFit:'cover'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="fr"><body>{children}</body></html>;}
