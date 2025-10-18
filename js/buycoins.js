// js/buycoins.js

const paymentBoxes = document.querySelectorAll('.payment-box');
const transactionInput = document.getElementById('transaction-id');
const confirmBtn = document.getElementById('confirm-btn');

let selectedPayment = null;

paymentBoxes.forEach(box => {
  box.addEventListener('click', () => {
    paymentBoxes.forEach(b => b.classList.remove('selected'));
    box.classList.add('selected');
    selectedPayment = box.dataset.method;
  });
});

confirmBtn.addEventListener('click', async () => {
  const transactionId = transactionInput.value.trim();
  const user = auth.currentUser;

  if(!selectedPayment){
    alert("Please select a payment method!");
    return;
  }
  if(!transactionId){
    alert("Please enter your transaction ID!");
    return;
  }

  try{
    await db.collection('payments').add({
      userId: user.uid,
      email: user.email,
      paymentMethod: selectedPayment,
      transactionId: transactionId,
      status: 'pending',
      timestamp: new Date()
    });
    alert("Payment request submitted! Your order is pending.");
    transactionInput.value = '';
    paymentBoxes.forEach(b => b.classList.remove('selected'));
    selectedPayment = null;
  } catch(err){
    console.error(err);
    alert("Error submitting payment. Try again.");
  }
});
