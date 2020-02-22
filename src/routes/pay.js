const router = require("express").Router();

const stripe = require('stripe')('sk_test_2BdzQB8KzOFVCJjBZr1UHIdk00CUKSeC3U');

function generateResponse(response, intent) {
  if (intent.status === 'succeeded') {
    // Handle post-payment fulfillment
    return response.send({ success: true });
  } else {
    // Any other status would be unexpected, so error
    return response.status(500).send({error: 'Unexpected status ' + intent.status});
  }
}

module.exports = (db, helper) => {
  router.post("/card", async (request, response) => {
    try {
      // Create the PaymentIntent
      let intent = await stripe.paymentIntents.create({
        amount: Number(request.body.top_up)*100,
        currency: 'cad',
        payment_method: request.body.payment_method_id,
  
        // A PaymentIntent can be confirmed some time after creation,
        // but here we want to confirm (collect payment) immediately.
        confirm: true,
  
        // If the payment requires any follow-up actions from the
        // customer, like two-factor authentication, Stripe will error
        // and you will need to prompt them for a new payment method.
        error_on_requires_action: true
      });
      const userId = request.body.user_id;
      const topUpAmount = request.body.top_up;
      if (userId && topUpAmount) {
        await helper.addToWallet(db, userId, Number(topUpAmount)*100);
        console.log('Added to db for', userId, topUpAmount, "dollars");

      }
      return generateResponse(response, intent);
    } catch (e) {
      if (e.type === 'StripeCardError') {
        // Display error on client
        return response.send({ error: e.message });
      } else {
        // Something else happened
        return response.status(500).send({ error: e.type });
      }
    }
  });
  


  return router
}
