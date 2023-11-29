class EligibilityService {
  /**
   * Compare cart data with criteria to compute eligibility.
   * If all criteria are fulfilled then the cart is eligible (return true).
   *
   * @param cart
   * @param criteria
   * @return {boolean}
   */
  isEligible(cart, criteria) {
    // If there are no criteria, the cart is eligible
    if (Object.keys(criteria).length === 0) {
      return true;
    }

    for (const key in criteria) {
      if (criteria.hasOwnProperty(key)) {
        const criteriaValue = criteria[key];
        const cartValue = this.getValueByKeyPath(cart, key);

        if (Array.isArray(cartValue)) {
          if (Array.isArray(criteriaValue)) {
            if (!this.isValueEqual(cartValue, criteriaValue)) {
              return false;
            }
          } else {
            if (!cartValue.includes(criteriaValue)) {
              return false;
            }
          }
        } else if(typeof criteriaValue === 'object' && this.checkOperator(cartValue, criteriaValue)) {
          continue;
        } else {
          if(!this.isValueEqual(cartValue, criteriaValue)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  isValueEqual(cartValue, criteriaValue) {
    return !!cartValue && cartValue == criteriaValue;
  }

  /**
   * This method checks if the cart value matches the criteria value
   * based on the operator
   */
  checkOperator(cartValue, criteriaValue) {
    switch (Object.keys(criteriaValue)[0]) {
      case 'and': 
        return this.andOperator(cartValue, criteriaValue.and);
      case 'or':
        return this.orOperator(cartValue, criteriaValue.or);
      case 'gt':
        return cartValue > criteriaValue.gt;
      case 'gte':
        return cartValue >= criteriaValue.gte;
      case 'lt':
        return cartValue < criteriaValue.lt;
      case 'lte':
        return cartValue <= criteriaValue.lte;
      case 'in':
        return criteriaValue.in.includes(cartValue);
      default:
        return false;
    }
  }

  /**
   * This method checks if the cart value matches all of the criteria values.
   */
  andOperator(cartValue, criteriaValue) {
    for (const [key, value] of Object.entries(criteriaValue)) {
      if(!this.checkOperator(cartValue, { [key]: value })) {
        return false;
      } else {
        continue
      }
    }
    return true
  }

  /**
   * This method checks if the cart value matches at least one of the criteria values.
   */
  orOperator(cartValue, criteriaValue) {
    for (const [key, value] of Object.entries(criteriaValue)) {
      if(this.checkOperator(cartValue, { [key]: value })) {
        return true;
      } else {
        continue
      }
    }
    return false
  }

  /**
   * Get the value of an object by key path
   */
  getValueByKeyPath(object, keyPath) {
    const keys = keyPath.split('.');

    let value = object;
    for (const key of keys) {
      if (Array.isArray(value)) {
        value = value.map((item) => this.getValueByKeyPath(item, key));
      } else if (value && typeof value === 'object') {
        value = value[key];
      } else {
        value = undefined;
      }
    }
    return value;
  }
}

module.exports = {
  EligibilityService,
};
