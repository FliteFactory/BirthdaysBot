const { Telegraf } = require("telegraf");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

const subFilePath = path.join(__dirname, "subscribers.json");
const dataFilePath = path.join(__dirname, "data.json");
const TOKEN = "8621986436:AAHuT6KV_sJ-0vhnFxPG6M7fWnfdchbY1fI";
const bot = new Telegraf(TOKEN);

let subscribers = loadSubscribers();
const birthdays = JSON.parse(fs.readFileSync(dataFilePath, "utf-8"));

bot.start((ctx) => {
    const chatId = ctx.chat.id;
    if (!subscribers.includes(chatId)) {
        subscribers.push(chatId);
        saveSubscribers(subscribers);
    }
    ctx.reply("Вы подписаны на уведомления👍");
});

bot.command("test", (ctx) => {
    ctx.reply("Бот работает");
});

function checkBirthdays() {
    const now = new Date();
    const today = now.toISOString().slice(5, 10);
    const tomorrowDate = new Date();
    tomorrowDate.setDate(now.getDate() + 1);
    const tomorrow = tomorrowDate.toISOString().slice(5, 10);

    birthdays.forEach(person => {
        if (person.date === tomorrow) {
            sendAll(`У ${person.name} <b>завтра</b> день рождения🕰️`);
        }
        if (person.date === today) {
            sendAll(`У ${person.name} <b>сегодня</b> день рождения🎉`);
        }
    })
}

/*загружаем chatId пользователей из файла*/
function loadSubscribers() {
    try {
        const data = fs.readFileSync(subFilePath, "utf-8");
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

/*сохраняем пользователей в файл*/
function saveSubscribers(subscribers) {
    fs.writeFileSync(subFilePath, JSON.stringify(subscribers, null, 2));
}

function sendAll(message) {
    subscribers.forEach(chatId => {
        bot.telegram.sendMessage(chatId, message, {parse_mode: "HTML"});
    });
}

//ЗАПУСК БОТА
bot.launch();

cron.schedule("50 7 * * *", () => {
    checkBirthdays();
}, {
    timezone: "Europe/Moscow"
});
