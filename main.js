"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // Select tab elements and tablist
  const tabs = document.querySelectorAll('[role="tab"]');
  const tabList = document.querySelector('[role="tablist"]');
  const tabPanel = document.querySelector('[role="tabpanel"]');
  const cards = document.querySelector(".cards");

  // Fetch data from the JSON file
  async function fetchData() {
    try {
      const response = await fetch("/data.json");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return await response.json();
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  // Initialize the main functionality
  async function main() {
    const data = await fetchData();

    updateCards("daily", data);

    tabs.forEach((tab) => {
      // Event listener for tab click
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        const timeFrame = tab.getAttribute("data-timeFrame");
        updateCards(timeFrame, data);
        setActiveTab(tab);
      });

      // Event listener for keyboard navigation
      tab.addEventListener("keydown", (e) => {
        const index = Array.prototype.indexOf.call(tabs, e.currentTarget);
        let dir = null;

        switch (e.which) {
          case 37: // Left arrow
          case 38: // Up arrow
            dir = "previous";
            break;
          case 39: // Right arrow
          case 40: // Down arrow
            dir = "next";
            break;
        }

        if (dir) {
          e.preventDefault();
          navigateTabs(index, dir, data);
        }
      });
    });
  }

  // Navigate tabs based on keyboard input
  function navigateTabs(index, direction, data) {
    const newIndex =
      direction === "previous"
        ? (index - 1 + tabs.length) % tabs.length
        : (index + 1) % tabs.length;

    const newTab = tabs[newIndex];
    newTab.focus();
    const timeFrame = newTab.getAttribute("data-timeFrame");
    updateCards(timeFrame, data);
    setActiveTab(newTab);
  }

  // Update card content based on the selected timeframe
  function updateCards(timeFrame, data) {
    cards.innerHTML = "";

    data.forEach((stat) => {
      const title = stat.title.toLowerCase().replace(" ", "-");
      const li = document.createElement("li");
      li.classList.add("card", title);

      let previous;
      switch (timeFrame) {
        case "daily":
          previous = `Yesterday - ${stat.timeframes[timeFrame].previous}hrs`;
          break;
        case "weekly":
          previous = `Last Week - ${stat.timeframes[timeFrame].previous}hrs`;
          break;
        case "monthly":
          previous = `Last Month - ${stat.timeframes[timeFrame].previous}hrs`;
          break;
      }

      li.innerHTML = `
        <img class="card__image" src="/assets/images/icon-${title}.svg" alt="" />
        <div class="card__content">
          <div class="card__header">
            <h2 class="card__title">
              <a class="card__link" href="#">${stat.title}</a>
            </h2>
            <button class="btn card__ellipsis-btn" aria-label="Menu - ${title}" aria-expanded="false">
              <svg
                focusable="false"
                aria-hidden="true"
                width="21"
                height="5"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.5 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm8 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm8 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z"
                  fill-rule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div class="card__description">
            <p class="current">${stat.timeframes[timeFrame].current}hrs</p>
            <p class="previous">${previous}</p>
          </div>
        </div>
      `;

      li.style.cursor = "pointer";

      let down,
        up,
        link = li.querySelector("h2 a");

      li.onmousedown = () => (down = +new Date());
      li.onmouseup = () => {
        up = +new Date();
        if (up - down < 200) {
          link.click();
        }
      };

      cards.appendChild(li);
    });
  }

  // Set the active tab and update ARIA attributes
  function setActiveTab(activeTab) {
    tabs.forEach((tab) => {
      const isActive = tab === activeTab;
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
      tab.setAttribute("tabindex", isActive ? "0" : "-1");
      tab.classList.toggle("current", isActive);

      if (isActive) {
        let timeFrame = tab.getAttribute("data-timeFrame");
        tab.href = `#${timeFrame}-panel`;

        tabPanel.id = `${timeFrame}-panel`;
        tabPanel.setAttribute("aria-labeledby", `${timeFrame}-tab`);

        tab.setAttribute("aria-controls", `${timeFrame}-panel`);
      }
    });
  }

  // Update the orientation of the tablist based on window width
  function updateTablistOrientation() {
    const isWide = window.innerWidth >= 1040;
    const newOrientation = isWide ? "vertical" : "horizontal";
    const currentOrientation = tabList.getAttribute("aria-orientation");

    if (currentOrientation !== newOrientation) {
      tabList.setAttribute("aria-orientation", newOrientation);
    }
  }

  // Initialize the orientation update and add event listener for window resize
  updateTablistOrientation();
  window.addEventListener("resize", updateTablistOrientation);

  // Start the main functionality
  main();
});
