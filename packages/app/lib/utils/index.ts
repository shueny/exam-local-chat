import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { botResponses } from "../../components/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getRandomBotResponse = () => {
  const randomIndex = Math.floor(Math.random() * botResponses.length);
  return botResponses[randomIndex];
};
