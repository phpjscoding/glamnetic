/**
 * Clones a DOM element (by ID or class selector) along with ALL its computed styles
 * including all child elements. Returns the cloned element with identical appearance.
 *
 * @param {string} selector - CSS selector like "#mySection" or ".header-class"
 * @returns {HTMLElement|null} The fully styled clone, or null if not found
 */
function cloneElementWithAllStyles(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    console.error(`Element not found: ${selector}`);
    return null;
  }

  // Step 1: Clone the element with all its children
  const clone = element.cloneNode(true);

  // Step 2: Copy all computed styles recursively
  function copyComputedStyles(source, target) {
    const computed = window.getComputedStyle(source);
    const targetStyle = target.style;

    // Copy all CSS properties
    for (let i = 0; i < computed.length; i++) {
      const prop = computed[i];
      targetStyle.setProperty(prop, computed.getPropertyValue(prop), computed.getPropertyPriority(prop));
    }

    // Also copy pseudo-elements (::before, ::after) if they exist
    ['before', 'after'].forEach(pseudo => {
      const pseudoStyle = window.getComputedStyle(source, ':' + pseudo);
      if (pseudoStyle.content && pseudoStyle.content !== 'none') {
        const styleAttr = target.getAttribute('style') || '';
        const pseudoCSS = `
          ${target.tagName.toLowerCase()}::${pseudo} {
            ${Array.from(pseudoStyle).map(p => `${p}: ${pseudoStyle.getPropertyValue(p)};`).join(' ')}
          }`;
        // We'll handle pseudo-elements via injected <style> later
      }
    });
  }

  // Step 3: Walk through source and clone nodes and apply styles
  function traverseAndCopy(sourceNode, targetNode) {
    copyComputedStyles(sourceNode, targetNode);

    const sourceChildren = sourceNode.children;
    const targetChildren = targetNode.children;

    for (let i = 0; i < sourceChildren.length; i++) {
      traverseAndCopy(sourceChildren[i], targetChildren[i]);
    }
  }

  traverseAndCopy(element, clone);

  // Step 4: Handle pseudo-elements (::before, ::after) via a <style> tag
  const styleTag = document.createElement('style');
  let pseudoCSSRules = '';

  function collectPseudoStyles(node, selectorPrefix = '') {
    const tag = node.tagName.toLowerCase();
    const currentSelector = selectorPrefix ? `${selectorPrefix} > ${tag}:nth-child(${Array.from(node.parentNode.children).indexOf(node) + 1})` : tag;

    ['before', 'after'].forEach(pseudo => {
      try {
        const pseudoStyle = window.getComputedStyle(node, ':' + pseudo);
        if (pseudoStyle.content && pseudoStyle.content !== 'none' && pseudoStyle.content !== '') {
          const rules = [];
          for (let i = 0; i < pseudoStyle.length; i++) {
            const prop = pseudoStyle[i];
            rules.push(`${prop}: ${pseudoStyle.getPropertyValue(prop)}`);
          }
          pseudoCSSRules += `${currentSelector}::${pseudo} { ${rules.join('; ')}; }\n`;
        }
      } catch (e) {
        // Some pseudo-elements may not be accessible
      }
    });

    Array.from(node.children).forEach((child, index) => {
      collectPseudoStyles(child, `${currentSelector}:nth-child(${index + 1})`);
    });
  }

  collectPseudoStyles(element);

  if (pseudoCSSRules) {
    styleTag.textContent = pseudoCSSRules;
    // Insert style tag into the clone (or document if needed)
    clone.appendChild(styleTag);
  }

  return clone;
}

// ==================== USAGE EXAMPLES ====================

// Clone by ID
const clonedSection = cloneElementWithAllStyles('#hero-section');
if (clonedSection) {
  document.body.appendChild(clonedSection); // Now it's a perfect visual copy!
}

// Clone by class (first match)
const clonedCard = cloneElementWithAllStyles('.product-card');
if (clonedCard) {
  document.querySelector('.container').appendChild(clonedCard);
}