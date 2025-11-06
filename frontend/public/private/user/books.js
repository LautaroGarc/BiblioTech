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

/* Generar tarjetas CORREGIDO */
function renderBooks(list) {
  container.innerHTML = "";
  list.forEach(book => {
    const card = document.createElement("article");
    card.className = "book";
    card.setAttribute("data-id", book.id);

    const img = document.createElement("img");
    img.className = "cover";
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

    const stockLine = document.createElement("div");
    stockLine.className = `stock-line ${book.stock > 0 ? 'stock-available' : 'stock-unavailable'}`;

    const indicator = document.createElement("span");
    indicator.className = "indicator";

    const stockText = document.createElement("span");
    stockText.textContent = book.stock > 0 ? `Disponible (Stock: ${book.stock})` : `Sin stock`;

    stockLine.appendChild(indicator);
    stockLine.appendChild(stockText);

    const footer = document.createElement("div");
    footer.className = "book-footer";
    
    const viewBtn = document.createElement("button");
    viewBtn.type = "button";
    viewBtn.className = "view-btn";
    viewBtn.textContent = "Ver / Alquilar";
    viewBtn.disabled = book.stock === 0;

    // Agregar elementos al body
    body.appendChild(title);
    body.appendChild(author);
    body.appendChild(stockLine);
    body.appendChild(footer);

    // Agregar elementos al card
    card.appendChild(img);
    card.appendChild(body);
    footer.appendChild(viewBtn);

    // Event listeners
    card.addEventListener("click", (e) => {
      if (e.target === viewBtn || !e.target.closest('button')) {
        openPopup(book.id);
      }
    });

    viewBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openPopup(book.id);
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
  popupAuthor.textContent = book.author;
  popupDesc.textContent = book.description;
  
  // Actualizar stock en popup
  const stockClass = book.stock > 0 ? 'stock-available' : 'stock-unavailable';
  popupStock.textContent = book.stock > 0 ? `Disponible (Stock: ${book.stock})` : `Sin stock`;
  popupStock.className = `stock-line ${stockClass}`;

  // Limpiar form y feedback
  rentForm.reset();
  feedback.textContent = "";
  feedback.className = "feedback";
  submitRentBtn.disabled = (book.stock === 0);

  // Mostrar popup
  popup.classList.add("active");
  document.body.style.overflow = "hidden";
}

/* Cerrar popup */
function closePopup() {
  popup.classList.remove("active");
  currentBookId = null;
  document.body.style.overflow = "";
}

/* Reducir stock en el array, actualizar DOM */
function decrementStock(bookId) {
  const book = BOOKS.find(b => b.id === bookId);
  if (!book || book.stock <= 0) return;
  
  book.stock -= 1;
  // Re-render de tarjetas para actualizar indicadores
  renderBooks(filterBooks(searchInput.value));
}

/* Form submit */
rentForm.addEventListener("submit", function (e) {
  e.preventDefault();
  
  const book = BOOKS.find(b => b.id === currentBookId);
  if (!book) return;

  // Validaciones
  const nombre = document.getElementById("nombre").value.trim();
  const fechaRetiro = document.getElementById("fecha-retiro").value;
  const fechaDevolucion = document.getElementById("fecha-devolucion").value;
  const curso = document.getElementById("curso").value.trim();
  const turno = document.getElementById("turno").value;

  if (!nombre || !fechaRetiro || !fechaDevolucion || !curso || !turno) {
    feedback.textContent = "Por favor completá todos los campos.";
    feedback.className = "feedback error";
    return;
  }

  const dRetiro = new Date(fechaRetiro);
  const dDevol = new Date(fechaDevolucion);
  if (dDevol < dRetiro) {
    feedback.textContent = "La fecha de devolución no puede ser anterior a la de retiro.";
    feedback.className = "feedback error";
    return;
  }

  if (book.stock <= 0) {
    feedback.textContent = "Lo sentimos, este libro no tiene stock disponible.";
    feedback.className = "feedback error";
    submitRentBtn.disabled = true;
    return;
  }

  // Simular alquiler
  decrementStock(book.id);

  // Mostrar feedback positivo
  feedback.textContent = "¡Alquiler solicitado con éxito! El stock fue actualizado.";
  feedback.className = "feedback success";

  // Cerrar popup después de 1.5 segundos
  setTimeout(() => {
    closePopup();
  }, 1500);
});

/* Event listeners para cerrar popup */
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