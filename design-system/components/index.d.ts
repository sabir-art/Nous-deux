import * as React from "react";
type Partner = "a" | "b" | "nous";
type Tone = "lavande" | "rose" | "lilas" | "menthe" | "beurre" | "peche" | "neutre";
type IconName = "home" | "calendar" | "plus" | "wallet" | "chat" | "heart" | "check" | "x" | "cart" | "meal" | "send" | "sparkle" | "clock" | "lock" | "chevron" | "minus";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: "primary" | "love" | "secondary" | "ghost" | "ink" | "outline"; size?: "md" | "lg"; icon?: IconName; children?: React.ReactNode; }
export interface PillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { selected?: boolean; icon?: IconName; children?: React.ReactNode; }
export interface PillGroupProps { options: { value: string; label: string }[]; value?: string; defaultValue?: string; onChange?: (v: string) => void; label?: string; }
export interface AvatarProps { name: string; partner?: Partner; size?: number; }
export interface AvatarPairProps { a: string; b: string; size?: number; }
export interface CategoryTileProps { title: string; count?: number | string; tone?: Tone; onClick?: () => void; }
export interface EventCardProps { title: React.ReactNode; meta?: React.ReactNode; dow?: string; day?: number; today?: boolean; who?: Partner; names?: [string, string]; tone?: Tone; }
export interface DayStripProps { days: { dow: string; day: number; label?: string; who?: Partner[] }[]; selected?: number; onSelect?: (day: number) => void; }
export interface BillCardProps { label: React.ReactNode; amount: string; status?: "unpaid" | "soon" | "late" | "paid"; statusText?: string; children?: React.ReactNode; }
export interface PaydayCardProps { total: number; elapsed: number; title?: string; }
export interface TodoItemProps { title: string; note?: string; done?: boolean; onToggle?: (done: boolean) => void; points?: string; assignee?: { name: string; partner: Partner }; }
export interface DishCardProps { name: string; emoji?: string; image?: string; tone?: Tone; tags?: string[]; onNo?: () => void; onYes?: () => void; actions?: boolean; }
export interface MatchStickerProps { title?: string; subtitle?: string; toneA?: BuddyTone; toneB?: BuddyTone; }
type BuddyTone = "lavande" | "rose" | "lilas" | "menthe" | "beurre" | "peche" | "citron" | "heart";
export interface BuddyProps { shape?: "blob" | "pill" | "flower" | "dome" | "pot"; tone?: BuddyTone; mood?: "wow" | "happy" | "love" | "sleepy"; look?: "left" | "right" | "up" | "down"; size?: number; bob?: boolean; label?: string; className?: string; style?: React.CSSProperties; }
export interface StickerProps { tone?: Tone | "citron" | "heart" | "sapin" | "ink"; size?: "sm"; rotate?: number; children: React.ReactNode; }
export interface StickerStackProps { words: { text: string; tone?: StickerProps["tone"] }[]; size?: "sm"; }
export interface HeroCardProps { tone?: Tone | "citron" | "sapin"; title: React.ReactNode; text?: React.ReactNode; action?: string; onAction?: () => void; buddy?: BuddyProps; }
export interface PiggyBankProps { variant?: "classique" | "bulle" | "geo" | "pieces"; label: string; value: number; goal: number; mode?: "budget" | "epargne"; note?: string; envelopes?: { label: string; pct: number; tone?: Tone | "citron" }[]; }
export interface PlantCardProps { name: React.ReactNode; species?: PlantSpecies; every?: number; daysSinceWater?: number; night?: boolean; mood?: PlantMood; potTone?: BuddyTone; thirsty?: boolean; next?: React.ReactNode; who?: { name: string; partner: Partner }; week?: { dow: string; day: number; state?: "due" | "done"; today?: boolean }[]; action?: string; onWater?: () => void; }
export interface ChatThreadProps { messages: { from: "me" | "them"; text: React.ReactNode; time?: string }[]; composer?: boolean; placeholder?: string; }
export interface TabBarProps { active?: "home" | "agenda" | "argent" | "nous"; onChange?: (tab: string) => void; onAdd?: () => void; }
export interface IconProps { name: IconName; size?: "sm"; label?: string; className?: string; }
export interface FoodItemProps { name: string; qty?: string; emoji?: string; tone?: Tone; done?: boolean; onToggle?: (done: boolean) => void; checkable?: boolean; }
export declare function foodEmoji(name: string, fallback?: string): string;
export interface StatTileProps { tone?: Tone; label: string; value: string; emoji?: string; delta?: { value: string; up: boolean; good: boolean; vs?: string }; trend?: number[]; }
type DataColor = "data-1" | "data-2" | "data-3" | "data-4" | "data-5" | "data-6";
type ChartDeco = { emoji?: string; deco?: Tone | "citron"; headline?: string; badge?: { text: string; tone?: string } };
export interface BarChartProps extends ChartDeco { current?: number; title: string; subtitle?: string; data: { label: string; values: number[] }[]; series?: { name: string; who?: Partner; color?: DataColor }[]; unit?: string; xLabel?: string; summary?: string; }
export interface LineChartProps extends ChartDeco { fromZero?: boolean; title: string; subtitle?: string; labels: string[]; series: { name: string; values: number[]; color?: DataColor }[]; goal?: number; unit?: string; xLabel?: string; summary?: string; }
export interface SplitBarProps extends ChartDeco { title: string; subtitle?: string; items: { name: string; value: number; color?: DataColor }[]; verdict?: string; summary?: string; }
export interface RankedBarsProps { title: string; subtitle?: string; items: { label: string; value: number; emoji?: string; budget?: number; tone?: Tone }[]; emoji?: string; }
export interface DivergingBarsProps extends ChartDeco { title: string; subtitle?: string; data: { label: string; value: number }[]; posLabel?: string; negLabel?: string; unit?: string; xLabel?: string; summary?: string; }
export interface CalendarHeatmapProps extends ChartDeco { title: string; subtitle?: string; month?: string; startDow?: number; days: { day: number; value?: number; today?: boolean }[]; summary?: string; }
type PlantSpecies = "feuille" | "pousse" | "monstera" | "cactus";
type PlantMood = "love" | "happy" | "ok" | "thirsty" | "sad" | "sleep";
export interface PlantBuddyProps { species?: PlantSpecies; name?: string; daysSinceWater?: number; every?: number; night?: boolean; mood?: PlantMood; potTone?: BuddyTone; size?: number; phrase?: string; speech?: boolean; interactive?: boolean; waterButton?: boolean; onWater?: () => void; onPoke?: () => void; }
export declare function plantMood(daysSinceWater: number, every: number, night?: boolean): PlantMood;
export interface GaugeTileProps { label: string; emoji?: string; value: number; max?: number; display?: string; caption?: string; tone?: Tone; color?: DataColor; }
export interface RecipeRowProps { name: string; emoji?: string; tone?: Tone; time: string; rating?: string; by?: { name: string; partner: Partner }; onClick?: () => void; }
export interface Dish { name: string; emoji?: string; tone?: Tone; tags?: string[]; }
export interface SwipeDeckProps { dishes: Dish[]; partner?: { name: string; partner: Partner }; partnerDone?: boolean; partnerLikes?: string[]; onFinish?: (likes: string[]) => void; onOpenRecipe?: (dish: Dish) => void; }
export interface Recipe { name: string; emoji?: string; image?: string; tone?: Tone; matched?: boolean; by?: { name: string; partner: Partner }; time: string; difficulty: string; servings: number; ingredients: { name: string; qty: string; emoji?: string; tone?: Tone }[]; steps: { title: string; text: string; timer?: number; timerLabel?: string }[]; }
export interface RecipeViewProps { recipe: Recipe; favorite?: boolean; onClose?: () => void; onAddToList?: () => void; }
export interface WhoDoesItGameProps { players: { name: string; partner: Partner }[]; tasks?: { name: string; emoji: string }[]; otherDoesNext?: boolean; onDone?: () => void; }
