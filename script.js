let total = Number(localStorage.getItem("total")) || 0;
let expenses = [];

try {
    expenses = JSON.parse(localStorage.getItem("expenses")) || [];
} catch {
    expenses = [];
}

const els = {
    amountResult: document.getElementById("amountResult"),
    alerts: document.getElementById("alerts"),
    addTotalButton: document.getElementById("addTotalButton"),
    addExpenseButton: document.getElementById("addExpenseButton"),
    deleteAllButton: document.getElementById("deleteAllButton"),
    showTableButton: document.getElementById("showTableButton"),
    hideTableButton: document.getElementById("hideTableButton"),
    emptyState: document.getElementById("emptyState"),
    tableContainer: document.getElementById("tableContainer"),
    expensesBody: document.getElementById("expensesBody"),
    totalModal: document.getElementById("totalModal"),
    expenseModal: document.getElementById("expenseModal"),
    totalForm: document.getElementById("totalForm"),
    expenseForm: document.getElementById("expenseForm"),
    modalTotalAmount: document.getElementById("modalTotalAmount"),
    modalDescription: document.getElementById("modalDescription"),
    modalAmount: document.getElementById("modalAmount")
};

render();

els.addTotalButton.addEventListener("click", openTotalModal);
els.addExpenseButton.addEventListener("click", openExpenseModal);
els.deleteAllButton.addEventListener("click", deleteAllData);
els.showTableButton.addEventListener("click", showTable);
els.hideTableButton.addEventListener("click", hideTable);

els.totalForm.addEventListener("submit", function (event) {
    event.preventDefault();
    submitTotal();
});

els.expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();
    submitExpense();
});

document.querySelectorAll("[data-close-modal]").forEach(function (button) {
    button.addEventListener("click", function () {
        closeModal(button.getAttribute("data-close-modal"));
    });
});

[els.totalModal, els.expenseModal].forEach(function (modal) {
    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            closeModal(modal.id);
        }
    });
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeTotalModal();
        closeExpenseModal();
    }
});

els.expensesBody.addEventListener("click", function (event) {
    const button = event.target.closest("[data-delete-index]");

    if (!button) return;

    deleteExpense(Number(button.dataset.deleteIndex));
});

function formatMoney(value) {
    return Number(value).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function render() {
    renderBalance();
    renderExpenses();
}

function renderBalance() {
    els.amountResult.textContent = "₱ " + formatMoney(total);
}

function renderExpenses() {
    const fragment = document.createDocumentFragment();
    let runningTotal = total;

    expenses.forEach(function (item, index) {
        const row = document.createElement("tr");

        const descriptionCell = document.createElement("td");
        descriptionCell.textContent = item.description;

        const amountCell = document.createElement("td");
        amountCell.className = "amount";
        amountCell.textContent = "₱" + formatMoney(item.amount);

        const resultCell = document.createElement("td");
        resultCell.className = "result";
        resultCell.textContent = "₱" + formatMoney(runningTotal) + " - ₱" + formatMoney(item.amount) + " = ₱" + formatMoney(runningTotal - item.amount);

        const actionCell = document.createElement("td");
        actionCell.className = "actions";

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "inline-btn";
        deleteButton.textContent = "Delete";
        deleteButton.dataset.deleteIndex = index;

        actionCell.appendChild(deleteButton);
        row.append(descriptionCell, amountCell, resultCell, actionCell);
        fragment.appendChild(row);

        runningTotal -= item.amount;
    });

    els.expensesBody.replaceChildren(fragment);

    const hasExpenses = expenses.length > 0;
    els.emptyState.classList.toggle("hidden", hasExpenses);
    els.tableContainer.querySelector("table").classList.toggle("hidden", !hasExpenses);
}

function saveData() {
    localStorage.setItem("total", String(total));
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

function setAlert(message) {
    els.alerts.textContent = message;
}

function clearAlert() {
    els.alerts.textContent = "";
}

function openModal(modal) {
    modal.classList.add("show");

    const firstInput = modal.querySelector("input");

    setTimeout(function () {
        if (firstInput) {
            firstInput.focus();
        }
    }, 50);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);

    if (modal) {
        modal.classList.remove("show");
    }
}

function openTotalModal() {
    openModal(els.totalModal);
}

function closeTotalModal() {
    closeModal("totalModal");
}

function openExpenseModal() {
    openModal(els.expenseModal);
}

function closeExpenseModal() {
    closeModal("expenseModal");
}

function getAmount(input) {
    const amount = Number.parseFloat(input.value);
    return Number.isFinite(amount) ? amount : 0;
}

function submitTotal() {
    const addedAmount = getAmount(els.modalTotalAmount);

    if (!Number.isFinite(addedAmount) || addedAmount <= 0) {
        setAlert("Enter an amount greater than 0.");
        return;
    }

    total += addedAmount;

    saveData();
    render();
    clearAlert();

    els.modalTotalAmount.value = "";
    closeTotalModal();
}

function submitExpense() {
    const description = els.modalDescription.value.trim();
    const amount = getAmount(els.modalAmount);

    if (!description) {
        setAlert("Enter a description for this expense.");
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        setAlert("Enter an expense amount greater than 0.");
        return;
    }

    if (amount > total) {
        setAlert("Insufficient funds!");
        return;
    }

    expenses.push({
        description: description,
        amount: amount
    });

    total -= amount;

    saveData();
    render();
    clearAlert();

    els.modalDescription.value = "";
    els.modalAmount.value = "";
    closeExpenseModal();
}

function deleteExpense(index) {
    const removedItem = expenses[index];

    if (!removedItem) return;

    total += removedItem.amount;

    expenses.splice(index, 1);

    saveData();
    render();
}

function deleteAllData() {
    const confirmed = window.confirm("Delete all expenses and reset the balance?");

    if (!confirmed) return;

    total = 0;
    expenses = [];

    localStorage.removeItem("total");
    localStorage.removeItem("expenses");

    hideTable();
    render();
    clearAlert();
}

function showTable() {
    els.tableContainer.classList.remove("hidden");
}

function hideTable() {
    els.tableContainer.classList.add("hidden");
}
