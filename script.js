const MQTT_HOST = "0934d4c052d7448db90141635738c6c1.s1.eu.hivemq.cloud";
const MQTT_PORT = 8884;const MQTT_USER = "ahmad";
const MQTT_PASS = "Ahmad12.";

let stateLampu1 = false;
let stateLampu2 = false;

const clientId = "WebClient_" + Math.random().toString(16).substr(2, 8);
const client = new Paho.MQTT.Client(MQTT_HOST, MQTT_PORT, clientId);

client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

connectBroker();

function connectBroker() {
    client.connect({
        onSuccess: onConnect,
        onFailure: onFailure,
        useSSL: true,
        userName: MQTT_USER,
        password: MQTT_PASS,
        keepAliveInterval: 30
    });
}

function onConnect() {
    document.getElementById("statusBadge").classList.add("connected");
    document.getElementById("statusText").innerText = "ONLINE";

    client.subscribe("suhu");
    client.subscribe("kelembapan");
    client.subscribe("OUTPUT/LED");
    client.subscribe("OUTPUT/LED1");
}

function onFailure(response) {
    document.getElementById("statusBadge").classList.remove("connected");
    document.getElementById("statusText").innerText = "FAILED";
    setTimeout(connectBroker, 5000); // Percobaan Reconnect Otomatis
}

function onConnectionLost(responseObject) {
    document.getElementById("statusBadge").classList.remove("connected");
    document.getElementById("statusText").innerText = "DISCONNECTED";
    if (responseObject.errorCode !== 0) {
        setTimeout(connectBroker, 5000);
    }
}

function onMessageArrived(message) {
    const topic = message.destinationName;
    const payload = message.payloadString.trim();

    if (topic === "suhu") {
        document.getElementById("valSuhu").innerText = payload;
    } else if (topic === "kelembapan") {
        document.getElementById("valHum").innerText = payload;
    } else if (topic === "OUTPUT/LED") {
        stateLampu1 = (payload === "ON");
        updateUI(1, stateLampu1);
    } else if (topic === "OUTPUT/LED1") {
        stateLampu2 = (payload === "ON1");
        updateUI(2, stateLampu2);
    }
}

function toggleLampu(lampNum) {
    let topic, payload;

    if (lampNum === 1) {
        topic = "OUTPUT/LED";
        payload = stateLampu1 ? "OFF" : "ON";
    } else if (lampNum === 2) {
        topic = "OUTPUT/LED1";
        payload = stateLampu2 ? "OFF1" : "ON1";
    }

    const message = new Paho.MQTT.Message(payload);
    message.destinationName = topic;
    message.retained = true;
    client.send(message);
}

function updateUI(lampNum, isOn) {
    const btn = document.getElementById("btnLampu" + lampNum);
    const txt = document.getElementById("txtLampu" + lampNum);

    if (lampNum === 1) {
        if (isOn) {
            btn.classList.add("active-lamp1");
            txt.innerText = "MENYALA";
        } else {
            btn.classList.remove("active-lamp1");
            txt.innerText = "MATI";
        }
    } else if (lampNum === 2) {
        if (isOn) {
            btn.classList.add("active-lamp2");
            txt.innerText = "MENYALA";
        } else {
            btn.classList.remove("active-lamp2");
            txt.innerText = "MATI";
        }
    }
}
