import { env } from "process";
import * as Raygun from "raygun";

export const raygun = new Raygun.Client().init({
  batch: true,
  apiKey: env.RAYGUN_API_KEY? env.RAYGUN_API_KEY : "",
});
