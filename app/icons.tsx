// Reuse the supplied line icons wherever the design system defines an equivalent.
// The remaining feature icons keep the same 24/18 px, rounded, 2 px stroke family.
import type {LucideProps} from 'lucide-react';
import {Icon} from '../design-system/runtime';
import type {IconProps} from '../design-system/components/index';
export * from 'lucide-react';
function supplied(name:IconProps['name']){return function DesignIcon({size=24,className,'aria-label':label}:LucideProps){return <Icon name={name} size={Number(size)<=18?'sm':undefined} className={className} label={label}/>;};}
export const Home=supplied('home'),Wallet=supplied('wallet'),CalendarDays=supplied('calendar'),Plus=supplied('plus'),Check=supplied('check'),X=supplied('x'),Heart=supplied('heart'),ShoppingBasket=supplied('cart'),MessageCircle=supplied('chat'),Send=supplied('send'),Clock=supplied('clock'),Clock3=supplied('clock'),LockKeyhole=supplied('lock'),ChevronRight=supplied('chevron'),Minus=supplied('minus'),Sparkles=supplied('sparkle'),UtensilsCrossed=supplied('meal');
