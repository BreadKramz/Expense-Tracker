let transactions = [];
let expenses = [];

try {
    transactions = JSON.parse(localStorage.getItem("transactions")) || [];
} catch {
    transactions = [];
}

try {
    expenses = JSON.parse(localStorage.getItem("expenses")) || [];
} catch {
    expenses = [];
}

const savedTotal = Number(localStorage.getItem("total")) || 0;
const savedInitialTotal = localStorage.getItem("initialTotal");

if (transactions.length === 0 && (savedTotal > 0 || expenses.length > 0)) {
    let initialTotal = savedInitialTotal !== null ? Number(savedInitialTotal) || 0 : savedTotal;

    if (savedInitialTotal === null && expenses.length > 0) {
        initialTotal += expenses.reduce(function (sum, item) {
            return sum + (Number(item.amount) || 0);
        }, 0);
    }

    if (initialTotal > 0) {
        transactions.push({
            type: "amount",
            description: "Added Amount",
            amount: initialTotal
        });
    }

    expenses.forEach(function (item) {
        const amount = Number(item.amount) || 0;

        if (amount > 0) {
            transactions.push({
                type: "expense",
                description: item.description || "Expense",
                amount: amount
            });
        }
    });
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

    deleteTransaction(Number(button.dataset.deleteIndex));
});

function formatMoney(value) {
    return Number(value).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function render() {
    renderBalance();
    renderTransactions();
}

function renderBalance() {
    els.amountResult.textContent = "₱ " + formatMoney(getRemainingBalance());
}

function getTransactionAmount(item) {
    const amount = Number(item.amount);
    return Number.isFinite(amount) ? amount : 0;
}

function getTotalAdded() {
    return transactions.reduce(function (sum, item) {
        return item.type === "amount" ? sum + getTransactionAmount(item) : sum;
    }, 0);
}

function getRemainingBalance() {
    return transactions.reduce(function (sum, item) {
        return item.type === "amount" ? sum + getTransactionAmount(item) : sum - getTransactionAmount(item);
    }, 0);
}

function renderTransactions() {
    const fragment = document.createDocumentFragment();
    let remainingBalance = 0;

    transactions.forEach(function (item, index) {
        const row = document.createElement("tr");
        const isExpense = item.type === "expense";
        const description = item.description || (isExpense ? "Expense" : "Added Amount");
        const amount = getTransactionAmount(item);

        remainingBalance += isExpense ? -amount : amount;

        addCell(row, "description", "Description", description);

        const typeCell = document.createElement("td");
        typeCell.dataset.label = "Type";
        typeCell.className = "type";

        const typeBadge = document.createElement("span");
        typeBadge.className = "transaction-type " + (isExpense ? "expense" : "amount");
        typeBadge.textContent = isExpense ? "Expense" : "Amount";

        typeCell.appendChild(typeBadge);
        row.appendChild(typeCell);

        addCell(row, "amount", "Amount", "₱" + formatMoney(amount));
        addCell(row, "result", "Remaining", "₱" + formatMoney(remainingBalance));

        if (isExpense) {
            const actionCell = document.createElement("td");
            actionCell.dataset.label = "Action";
            actionCell.className = "action-cell";

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "inline-btn";
            deleteButton.textContent = "Delete";
            deleteButton.setAttribute("aria-label", "Delete " + description);
            deleteButton.dataset.deleteIndex = index;

            actionCell.appendChild(deleteButton);
            row.appendChild(actionCell);
        } else {
            const emptyActionCell = document.createElement("td");
            emptyActionCell.dataset.label = "Action";
            emptyActionCell.className = "action-cell";
            row.appendChild(emptyActionCell);
        }

        fragment.appendChild(row);
    });

    els.expensesBody.replaceChildren(fragment);

    const hasTransactions = transactions.length > 0;
    els.emptyState.classList.toggle("hidden", hasTransactions);
    els.tableContainer.classList.toggle("hidden", !hasTransactions);

    if (hasTransactions) {
        els.tableContainer.querySelector("table").classList.remove("hidden");
    }
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
    localStorage.setItem("total", String(getRemainingBalance()));
    localStorage.setItem("initialTotal", String(getTotalAdded()));
    localStorage.setItem("transactions", JSON.stringify(transactions));
    localStorage.setItem("expenses", JSON.stringify(transactions
        .filter(function (item) { return item.type === "expense"; })
        .map(function (item) {
            return {
                description: item.description,
                amount: getTransactionAmount(item)
            };
        })));
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

    transactions.push({
        type: "amount",
        description: "Added Amount",
        amount: addedAmount
    });

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

    if (amount > getRemainingBalance()) {
        showMessage("Insufficient Funds", "Your current balance is not enough for this expense.");
        return;
    }

    transactions.push({
        type: "expense",
        description: description,
        amount: amount
    });

    saveData();
    render();

    els.modalDescription.value = "";
    els.modalAmount.value = "";
    closeExpenseModal();
}

function deleteTransaction(index) {
    const removedItem = transactions[index];

    if (!removedItem) return;

    transactions.splice(index, 1);

    saveData();
    render();
}

function deleteAllData() {
    transactions = [];
    expenses = [];

    localStorage.removeItem("total");
    localStorage.removeItem("initialTotal");
    localStorage.removeItem("transactions");
    localStorage.removeItem("expenses");

    closeConfirmModal();
    hideTable();
    render();
}

function showTable() {
    if (transactions.length === 0) {
        els.emptyState.classList.remove("hidden");
        els.tableContainer.classList.add("hidden");
        return;
    }

    els.tableContainer.classList.remove("hidden");
    els.tableContainer.querySelector("table").classList.remove("hidden");
}

function hideTable() {
    els.tableContainer.classList.add("hidden");
}
