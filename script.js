
document.getElementById("submitBtn").onclick = async () => {
  const content = document.getElementById("postContent").value;
  const file = document.getElementById("mediaUpload").files[0];
  const schedule = document.getElementById("scheduleInput").value;
  const checkboxes = document.querySelectorAll(".PlatformToggles input:checked");
  const platforms = {};
  checkboxes.forEach(cb => platforms[cb.value] = true);

  if (!content || Object.keys(platforms).length === 0) {
    document.getElementById("statusMessage").textContent = "Please write content and select platforms.";
    return;
  }

  const contentMap = {};
  for (let p in platforms) {
    contentMap[p] = optimizeHashtags(p, content);
  }

  const formData = new FormData();
  formData.append("platforms", JSON.stringify(platforms));
  formData.append("contentMap", JSON.stringify(contentMap));
  if (file) formData.append("media", file);
  if (schedule) formData.append("scheduled", schedule);

  document.getElementById("statusMessage").textContent = "⏳ Posting...";

  try {
    const res = await fetch("https://nextdam-proxy.vercel.app/api/post", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    document.getElementById("statusMessage").textContent = "✅ Posted to: " + Object.keys(data.results).join(", ");
    loadHistory();
  } catch (err) {
    document.getElementById("statusMessage").textContent = "❌ Error posting.";
  }
};

function optimizeHashtags(platform, text) {
  const base = text.replace(/#\w+/g, "").trim();
  const tags = {
    instagram: "#travel #sunset",
    tiktok: "#fyp #viral",
    x: "",
  };
  return base + " " + (tags[platform] || "");
}

async function loadHistory() {
  const res = await fetch("https://nextdam-proxy.vercel.app/api/history");
  const data = await res.json();
  const container = document.getElementById("historyContainer");
  container.innerHTML = "";
  data.forEach(post => {
    const div = document.createElement("div");
    const date = new Date(post.postedAt._seconds * 1000).toLocaleString();
    div.innerHTML = `<strong>${date}</strong><br>${post.content}<br>✅ ${Object.keys(post.platforms).filter(k => post.platforms[k]).join(", ")}`;
    div.style.marginBottom = "10px";
    container.appendChild(div);
  });
}

loadHistory();
