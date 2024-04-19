const { Scenes } = require("telegraf");
import start from "./start";
import checkUser from "./checkUser";
import addBalance from "./addBalance";
const stage = new Scenes.Stage([start, checkUser, addBalance]);

export default stage;
