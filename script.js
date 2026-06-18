let total = Number(localStorage.getItem("total")) || 0;
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

document.getElementById("amountResult").innerHTML =
    '₱ ' + formatMoney(total);

renderExpenses();

function formatMoney(value) {
    return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function openTotalModal() {
    document.getElementById('totalModal').style.display = 'block';
}

function closeTotalModal() {
    document.getElementById('totalModal').style.display = 'none';
}

function openExpenseModal() {
    document.getElementById('expenseModal').style.display = 'block';
}

function closeExpenseModal() {
    document.getElementById('expenseModal').style.display = 'none';
}

function hideTable() {
    document.getElementById('tableContainer').style.display = 'none';
}

function showTable() {
    document.getElementById('tableContainer').style.display = 'block';
}

function submitTotal() {

    const addedAmount =
        Number(document.getElementById('modalTotalAmount').value);

    if (!addedAmount) return;

    total = total + addedAmount;

    localStorage.setItem("total", total);

    document.getElementById('amountResult').innerHTML =
        '₱ ' + formatMoney(total);

    document.getElementById('modalTotalAmount').value = '';

    closeTotalModal();
}

function submitExpense() {

    const description =
        document.getElementById('modalDescription').value;

    const amount =
        Number(document.getElementById('modalAmount').value);

    if (!amount) return;

    if (amount > total) {
        document.getElementById('alerts').innerHTML =
            'Insufficient funds!';
        return;
    }

    document.getElementById('alerts').innerHTML = '';

    expenses.push({
        description: description,
        amount: amount
    });

    total = total - amount;

    localStorage.setItem("expenses", JSON.stringify(expenses));
    localStorage.setItem("total", total);

    document.getElementById("amountResult").innerHTML =
        '₱ ' + formatMoney(total);

    document.getElementById('modalDescription').value = '';
    document.getElementById('modalAmount').value = '';

    closeExpenseModal();

    renderExpenses();
}

function renderExpenses() {

    document.getElementById('expenseDescription').innerHTML = '';
    document.getElementById('expenseAmount').innerHTML = '';
    document.getElementById('expenseResult').innerHTML = '';
    document.getElementById('expenseActions').innerHTML = '';

    let runningTotal = total;

    for (let i = 0; i < expenses.length; i++) {

        const item = expenses[i];

        document.getElementById('expenseDescription').innerHTML +=
            item.description + '<br><hr>';

        document.getElementById('expenseAmount').innerHTML +=
            '₱' + formatMoney(item.amount) + '<br><hr>';

        document.getElementById('expenseResult').innerHTML +=
            formatMoney(runningTotal) + ' - ' +
            formatMoney(item.amount) + ' = ' +
            formatMoney(runningTotal - item.amount) +
            '<br><hr>';

        document.getElementById('expenseActions').innerHTML +=
            '<button class="inline-btn" onclick="deleteExpense(' + i + ')">Delete</button><br><hr>';

        runningTotal -= item.amount;
    }
}

function deleteExpense(index) {

    const removedItem = expenses[index];

    total = total + removedItem.amount;

    expenses.splice(index, 1);

    localStorage.setItem("expenses", JSON.stringify(expenses));
    localStorage.setItem("total", total);

    document.getElementById("amountResult").innerHTML =
        '₱ ' + formatMoney(total);

    renderExpenses();
}

function deleteAllData() {

    total = 0;
    expenses = [];

    localStorage.removeItem("total");
    localStorage.removeItem("expenses");

    document.getElementById("amountResult").innerHTML = "₱ 0.00";

    document.getElementById('expenseDescription').innerHTML = '';
    document.getElementById('expenseAmount').innerHTML = '';
    document.getElementById('expenseResult').innerHTML = '';
    document.getElementById('expenseActions').innerHTML = '';

    document.getElementById('alerts').innerHTML = '';
}