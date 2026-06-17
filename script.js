let total = 0;

document.getElementById('description').addEventListener('input', function () {
    this.value = this.value.replace(/[^A-Za-z ]/g, '');
});

function addExpense() {
    const description = document.getElementById('description').value;
    const amount = Number(document.getElementById('amount').value);

    if (!amount) return;

    document.getElementById('alerts').innerHTML = '';

    if (amount > total) {
        document.getElementById('alerts').innerHTML = 'Insufficient funds!';
        return;
    }

    document.getElementById('expenseDescription').innerHTML += description + '<br><hr>';
    document.getElementById('expenseAmount').innerHTML += '₱' + formatMoney(amount) + '<br><hr>';
    document.getElementById('expenseResult').innerHTML += formatMoney(total) + ' - ' + formatMoney(amount) + ' = ' + formatMoney(total-amount) + '<br><hr>';
    
    total = total - amount;
    
    document.getElementById('amountResult').innerHTML = '₱ ' + formatMoney(total);
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
}  

function addTotalAmount() {
    const addedAmount = Number(document.getElementById('totalAmount').value);

    if (!addedAmount) return;

    total = total + addedAmount;

    document.getElementById('amountResult').innerHTML = '₱ ' + formatMoney(total);
    document.getElementById('totalAmount').value = '';
}

toLocaleString()

function formatMoney(value) {
    return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}