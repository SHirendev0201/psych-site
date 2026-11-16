(() => {
  const panel = document.createElement("dialog");
  panel.className = "therapist-panel";
  panel.setAttribute("aria-labelledby", "therapist-title");
  // Replace the sample photo and the placeholder details below with your therapist's information.
  panel.innerHTML = `<header class="therapist-heading">
      <h2 id="therapist-title">Сэтгэлзүйчтэй холбогдох</h2>
      <button type="button" class="therapist-close" aria-label="Хаах" autofocus>×</button>
    </header>
    <section class="therapist-profile" aria-label="Сэтгэлзүйчийн танилцуулга">
      <figure class="therapist-photo">
        <img src="therapist.jpg" alt="Танилцуулгын жишээ зураг — бодит сэтгэлзүйчийн зураг биш" width="104" height="116">
        <figcaption>100% бодит зураг</figcaption>
      </figure>
      <div>
        <h3>Ц.Ширэндэв</h3>
        <p class="therapist-role">Professional Toyota Prius Therapist</p>
        <span class="therapist-status">Online now</span>
      </div>
    </section>
    <p class="therapist-about">2024 оноос хойш тогтмол Prius-20 маркын автомашины байнгийн сэтгэлзүйч хийж байгаа.</p>
    <dl class="therapist-details">
      <div><dt>Уулзалтын хэлбэр</dt><dd>Биетээр, дотно</dd></div>
      <div><dt>Үргэлжлэх хугацаа</dt><dd>69 жил</dd></div>
      <div><dt>Зөвлөгөөний төлбөр</dt><dd>Чиний 2 бөөр</dd></div>
      <div><dt>Холбоо барих</dt><dd>+976 91234005</dd></div>
    </dl>
    <footer class="therapist-footer">
      <button type="button" class="button" disabled>Цаг захиалга одоогоор хаалттай</button>
      <p>Яахав ШУТИС дээр ирээд залга. Тоглох хэрэггүй!</p>
    </footer>`;
  document.body.append(panel);
  panel.querySelector(".therapist-close").addEventListener("click", () => panel.close());
  panel.addEventListener("click", (event) => {
    if (event.target !== panel) return;
    const rect = panel.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) panel.close();
  });
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("a,button");
    if (trigger && (trigger.dataset.act === "therapist" || trigger.hasAttribute("data-therapist") || /Сэтгэл\s*зүйчтэй холбогдох/.test(trigger.textContent))) {
      event.preventDefault();
      if (!panel.open) panel.showModal();
    }
  });
})();
