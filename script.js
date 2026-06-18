let total = Number(localStorage.getItem("total")) || 0;
let expenses = [];

try {
    expenses = JSON.parse(localStorage.getItem("expenses")) || [];
} catch {
    expenses = [];
}

const els = {
    amountResult: document.getElementById("amountResult"),
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
    messageModal: document.getElementById("messageModal"),
    messageTitle: document.getElementById("messageTitle"),
    messageText: document.getElementById("messageText"),
    confirmModal: document.getElementById("confirmModal"),
    confirmCancelButton: document.getElementById("confirmCancelButton"),
    confirmOkButton: document.getElementById("confirmOkButton"),
    totalForm: document.getElementById("totalForm"),
    expenseForm: document.getElementById("expenseForm"),
    modalTotalAmount: document.getElementById("modalTotalAmount"),
    modalDescription: document.getElementById("modalDescription"),
    modalAmount: document.getElementById("modalAmount")
};

render();

els.addTotalButton.addEventListener("click", openTotalModal);
els.addExpenseButton.addEventListener("click", openExpenseModal);
els.deleteAllButton.addEventListener("click", openConfirmModal);
els.confirmOkButton.addEventListener("click", deleteAllData);
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

[els.totalModal, els.expenseModal, els.messageModal, els.confirmModal].forEach(function (modal) {
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
        closeMessageModal();
        closeConfirmModal();
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

        addCell(row, "description", "Description", item.description);
        addCell(row, "amount", "Amount", "₱" + formatMoney(item.amount));
        addCell(row, "result", "Result", "₱" + formatMoney(runningTotal) + " - ₱" + formatMoney(item.amount) + " = ₱" + formatMoney(runningTotal - item.amount));

        const actionCell = document.createElement("td");
        actionCell.dataset.label = "Action";
        actionCell.className = "actions";

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "inline-btn";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("aria-label", "Delete " + item.description);
        deleteButton.dataset.deleteIndex = index;

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);
        fragment.appendChild(row);

        runningTotal -= item.amount;
    });

    els.expensesBody.replaceChildren(fragment);

    const hasExpenses = expenses.length > 0;
    els.emptyState.classList.toggle("hidden", hasExpenses);
    els.tableContainer.querySelector("table").classList.toggle("hidden", !hasExpenses);
}

function addCell(row, className, label, text) {
    const cell = document.createElement("td");

    if (className) {
        cell.className = className;
    }

    cell.dataset.label = label;
    cell.textContent = text;
    row.appendChild(cell);

    return cell;
}

function saveData() {
    localStorage.setItem("total", String(total));
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

function showMessage(title, message) {
    els.messageTitle.textContent = title;
    els.messageText.textContent = message;
    els.messageModal.classList.add("show");

    document.getElementById("messageCloseButton").focus();
}

function openConfirmModal() {
    els.confirmModal.classList.add("show");
    els.confirmCancelButton.focus();
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

function closeMessageModal() {
    closeModal("messageModal");
}

function closeConfirmModal() {
    closeModal("confirmModal");
}

function getAmount(input) {
    const amount = Number.parseFloat(input.value);
    return Number.isFinite(amount) ? amount : 0;
}

function submitTotal() {
    const addedAmount = getAmount(els.modalTotalAmount);

    if (!Number.isFinite(addedAmount) || addedAmount <= 0) {
        showMessage("Add Amount", "Enter an amount greater than 0.");
        return;
    }

    total += addedAmount;

    saveData();
    render();

    els.modalTotalAmount.value = "";
    closeTotalModal();
}

function submitExpense() {
    const description = els.modalDescription.value.trim();
    const amount = getAmount(els.modalAmount);

    if (!description) {
        showMessage("Add Expense", "Enter a description for this expense.");
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        showMessage("Add Expense", "Enter an expense amount greater than 0.");
        return;
    }

    if (amount > total) {
        showMessage("Insufficient Funds", "Your current balance is not enough for this expense.");
        return;
    }

    expenses.push({
        description: description,
        amount: amount
    });

    total -= amount;

    saveData();
    render();

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
    total = 0;
    expenses = [];

    localStorage.removeItem("total");
    localStorage.removeItem("expenses");

    closeConfirmModal();
    hideTable();
    render();
}

function showTable() {
    els.tableContainer.classList.remove("hidden");
}

function hideTable() {
    els.tableContainer.classList.add("hidden");
}
