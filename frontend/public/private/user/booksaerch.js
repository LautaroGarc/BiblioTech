/* Datos de ejemplo: arreglo de libros. Agregá o modificá aquí. */
const BOOKS = [
  {
    id: "b1",
    title: "Cien años de soledad",
    author: "Gabriel García Márquez",
    description: "Novela mágica sobre la familia Buendía y la historia mítica de Macondo.",
    cover: "100años.jpg",
    stock: 4
  },
  {
    id: "b2",
    title: "El túnel",
    author: "Ernesto Sabato",
    description: "Novela psicológica que explora los celos y la obsesión del protagonista.",
    cover: "covers/el_tunel.jpg",
    stock: 2
  },
  {
    id: "b3",
    title: "Orgullo y prejuicio",
    author: "Jane Austen",
    description: "Clásico de la literatura inglesa sobre amor, sociedad y malentendidos.",
    cover: "orgulloyprejuicio.jpg",
    stock: 0
  },
  {
    id: "b4",
    title: "1984",
    author: "George Orwell",
    description: "Distopía sobre vigilancia estatal y control de la verdad.",
    cover: "1984.webp",
    stock: 6
  }
];

/* Referencias DOM */
const container = document.getElementById("books-container");
const popup = document.getElementById("popup");
const closePopupBtn = document.getElementById("close-popup");
const popupImg = document.getElementById("popup-img");
const popupTitle = document.getElementById("popup-title");
const popupAuthor = document.getElementById("popup-author");
const popupDesc = document.getElementById("popup-desc");
const popupStock = document.getElementById("popup-stock");
const rentForm = document.getElementById("rent-form");
const submitRentBtn = document.getElementById("submit-rent");
const feedback = document.getElementById("form-feedback");
const searchInput = document.getElementById("search");

/* Estado */
let currentBookId = null;

/* Generar tarjetas */
function renderBooks(list) {
  container.innerHTML = "";
  list.forEach(book => {
    const card = document.createElement("article");
    card.className = "book";
    card.setAttribute("data-id", book.id);

    const img = document.createElement("img");
    img.className = "cover";
    // si no existe la imagen, puede mostrar una genérica
    img.src = book.cover || "covers/generic_cover.png";
    img.alt = `Portada de ${book.title}`;

    const body = document.createElement("div");
    body.className = "book-body";

    const title = document.createElement("h3");
    title.className = "book-title";
    title.textContent = book.title;

    const author = document.createElement("p");
    author.className = "book-author";
    author.textContent = book.author;

    const stockLine = document.createElement("p");
    stockLine.className = "stock-line";

    const indicator = document.createElement("span");
    indicator.className = "indicator";
    indicator.style.background = book.stock > 0 ? "var(--success)" : "var(--danger)";

    const stockText = document.createElement("span");
    stockText.textContent = book.stock > 0 ? `Disponible (Stock: ${book.stock})` : `Sin stock (Stock: 0)`;

    stockLine.appendChild(indicator);
    stockLine.appendChild(stockText);

    body.appendChild(title);
    body.appendChild(author);
    body.appendChild(stockLine);

    // footer con botón (solo visual — el popup hace la acción real)
    const footer = document.createElement("div");
    footer.className = "book-footer";
    const viewBtn = document.createElement("button");
    viewBtn.type = "button";
    viewBtn.textContent = "Ver / Alquilar";
    viewBtn.style.padding = "8px 10px";
    viewBtn.style.borderRadius = "8px";
    viewBtn.style.border = "none";
    viewBtn.style.background = "linear-gradient(90deg,var(--accent),#0b5ed7)";
    viewBtn.style.color = "white";
    viewBtn.style.cursor = "pointer";
    if (book.stock === 0) viewBtn.disabled = false; // permitimos abrir popup para ver detalles, aunque sin stock el submit estará deshabilitado

    footer.appendChild(viewBtn);

    // Click en tarjeta o botón abre popup
    card.appendChild(img);
    card.appendChild(body);
    card.appendChild(footer);

    card.addEventListener("click", (e) => {
      // evitar doble activación si se clickeó dentro un input o botón
      if (e.target.tagName.toLowerCase() === "button") {
        openPopup(book.id);
      } else {
        openPopup(book.id);
      }
    });

    container.appendChild(card);
  });
}

/* Abrir popup con info del libro */
function openPopup(bookId) {
  const book = BOOKS.find(b => b.id === bookId);
  if (!book) return;

  currentBookId = bookId;
  popupImg.src = book.cover || "covers/generic_cover.png";
  popupImg.alt = `Portada de ${book.title}`;
  popupTitle.textContent = book.title;
  popupAuthor.textContent = `Autor: ${book.author}`;
  popupDesc.textContent = book.description;
  updatePopupStock(book.stock);

  // limpiar form y feedback
  rentForm.reset();
  feedback.textContent = "";
  submitRentBtn.disabled = (book.stock === 0);

  popup.setAttribute("aria-hidden", "false");
  // bloqueo scroll
  document.body.style.overflow = "hidden";
}

/* Cerrar popup */
function closePopup() {
  popup.setAttribute("aria-hidden", "true");
  currentBookId = null;
  document.body.style.overflow = "";
}

/* Actualizar la línea de stock dentro del popup */
function updatePopupStock(stock) {
  const indicator = stock > 0 ? "🟢" : "🔴";
  popupStock.textContent = `${indicator} ${stock > 0 ? "Disponible" : "Sin stock"} (Stock: ${stock})`;
}

/* Reducir stock en el array, actualizar DOM */
function decrementStock(bookId) {
  const book = BOOKS.find(b => b.id === bookId);
  if (!book) return;
  if (book.stock <= 0) return;
  book.stock -= 1;
  // re-render de tarjetas para actualizar indicadores
  renderBooks(filterBooks(searchInput.value));
  // actualizar popup si sigue abierto en el mismo libro
  if (currentBookId === bookId) {
    updatePopupStock(book.stock);
    submitRentBtn.disabled = (book.stock === 0);
  }
}

/* Form submit */
rentForm.addEventListener("submit", function (e) {
  e.preventDefault();
  feedback.textContent = "";
  const book = BOOKS.find(b => b.id === currentBookId);
  if (!book) return;

  // validaciones simples
  const nombre = document.getElementById("nombre").value.trim();
  const fechaRetiro = document.getElementById("fecha-retiro").value;
  const fechaDevolucion = document.getElementById("fecha-devolucion").value;
  const curso = document.getElementById("curso").value.trim();
  const turno = document.getElementById("turno").value;

  if (!nombre || !fechaRetiro || !fechaDevolucion || !curso || !turno) {
    feedback.style.color = "var(--danger)";
    feedback.textContent = "Por favor completá todos los campos.";
    return;
  }

  const dRetiro = new Date(fechaRetiro);
  const dDevol = new Date(fechaDevolucion);
  if (dDevol < dRetiro) {
    feedback.style.color = "var(--danger)";
    feedback.textContent = "La fecha de devolución no puede ser anterior a la de retiro.";
    return;
  }

  if (book.stock <= 0) {
    feedback.style.color = "var(--danger)";
    feedback.textContent = "Lo sentimos, este libro no tiene stock disponible.";
    submitRentBtn.disabled = true;
    return;
  }

  // simulamos el "alquiler" en frontend: decrementamos el stock
  decrementStock(book.id);

  // mostrar feedback positivo
  feedback.style.color = "var(--success)";
  feedback.textContent = "Solicitud recibida. El stock fue actualizado.";

  // cerramos el popup luego de 1.2s
  setTimeout(() => {
    closePopup();
  }, 1200);
});

/* Botones cerrar */
closePopupBtn.addEventListener("click", closePopup);
popup.addEventListener("click", (e) => {
  if (e.target === popup) closePopup();
});

/* Búsqueda */
function filterBooks(q) {
  const term = String(q || "").trim().toLowerCase();
  if (term === "") return BOOKS;
  return BOOKS.filter(b => {
    return b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term);
  });
}

searchInput.addEventListener("input", (e) => {
  const filtered = filterBooks(e.target.value);
  renderBooks(filtered);
});

/* Inicializar */
renderBooks(BOOKS);

/* Nota:
 - Para usar portadas reales, creá la carpeta "covers" en la misma ubicación de los archivos
   y poné imágenes con los nombres indicados (o ajustá los paths en el array BOOKS).
 - Este sistema es frontend solamente; los cambios no persisten si recargás la página.
*/
