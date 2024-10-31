const calculateFinalPrice = (item) => {
    if (!item || !item.product) {
      return 0;
    }
  
    let basePrice;
    if (item.product.type === 'weight') {
      basePrice = item.product.pricePerUnit * item.quantity;
    } else {
      basePrice = item.product.price_sale || item.product.price;
    }
  
    let optionsPrice = 0;
  
    if (item.product.selectedOptions && typeof item.product.selectedOptions === 'object') {
      Object.values(item.product.selectedOptions).forEach(optionGroup => {
        if (Array.isArray(optionGroup)) {
          optionGroup.forEach(variation => {
            const quantity = variation.quantity || 1;
            optionsPrice += (variation.price || 0) * quantity;
          });
        } else if (typeof optionGroup === 'object' && optionGroup !== null) {
          const quantity = optionGroup.quantity || 1;
          optionsPrice += (optionGroup.price || 0) * quantity;
        }
      });
    }
  
    let totalPrice = basePrice + optionsPrice;
    if (item.product.type !== 'weight') {
      totalPrice *= item.quantity;
    }
  
    return parseFloat(totalPrice.toFixed(2));
  };
  
  const calculateOrderTotal = (orderCart) => {
    let cartTotal = 0;
  
    orderCart.forEach((item) => {
      cartTotal += calculateFinalPrice(item);
    });
  
    return cartTotal;
  };

  export default calculateOrderTotal;
  
  