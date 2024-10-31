const getFormattedAddress = (address) => {
    let addressParts = [];

    // Add name to the address parts if it exists
    if (address?.name && address.name.length > 0) {
        addressParts.push(address.name);
    }

    // Add apartment to the address parts if it exists
    if (address?.apartment && address.apartment.length > 0) {
        addressParts.push(address.apartment);
    }

    // Always add the base address if it exists
    if (address?.address && address.address.length > 0) {
        addressParts.push(address.address);
    }

    // Add city to the address parts if it exists
    if (address?.city && address.city.length > 0) {
        addressParts.push(address.city);
    }

    // Add state to the address parts if it exists
    if (address?.state && address.state.length > 0) {
        addressParts.push(address.state);
    }

    // Add country to the address parts if it exists
    if (address?.country && address.country.length > 0) {
        addressParts.push(address.country);
    }

    // Join the parts with a comma and space
    let formattedAddress = addressParts.join(", ");
    
    return formattedAddress;
}

export default getFormattedAddress