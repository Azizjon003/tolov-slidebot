import { Scenes } from "telegraf";
import enabled from "../utils/enabled";
import prisma from "../../prisma/prisma";
import { keyboards } from "../utils/keyboards";
import { externalId } from "./start";
const scene = new Scenes.BaseScene("addBalance");

scene.hears(/d/, async (ctx) => {});
export default scene;
