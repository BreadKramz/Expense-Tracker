let total = 0;

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

function submitTotal() {

    const addedAmount =
        Number(document.getElementById('modalTotalAmount').value);

    if (!addedAmount) return;

    total = total + addedAmount;

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

    document.getElementById('expenseDescription').innerHTML +=
        description + '<br><hr>';

    document.getElementById('expenseAmount').innerHTML +=
        '₱' + formatMoney(amount) + '<br><hr>';

    document.getElementById('expenseResult').innerHTML +=
        formatMoney(total) + ' - ' + formatMoney(amount) +
        ' = ' + formatMoney(total - amount) + '<br><hr>';

    total = total - amount;

    document.getElementById('amountResult').innerHTML =
        '₱ ' + formatMoney(total);

    document.getElementById('modalDescription').value = '';
    document.getElementById('modalAmount').value = '';

    closeExpenseModal();
}