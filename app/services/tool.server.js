/**
 * Tool Service
 * Manages tool execution and processing
 */
import { saveMessage } from "../db.server";
import AppConfig from "./config.server";


/**
 * Creates a tool service instance
 * @returns {Object} Tool service with methods for managing tools
 */
export function createToolService() {
  /**
   * Handles a tool error response
   * @param {Object} toolUseResponse - The error response from the tool
   * @param {string} toolName - The name of the tool
   * @param {string} toolUseId - The ID of the tool use request
   * @param {Array} conversationHistory - The conversation history
   * @param {Function} sendMessage - Function to send messages to the client
   * @param {string} conversationId - The conversation ID
   */
  const handleToolError = async (toolUseResponse, toolName, toolUseId, conversationHistory, sendMessage, conversationId) => {
    if (toolUseResponse.error.type === "auth_required") {
      console.log("Auth required for tool:", toolName);
      await addToolResultToHistory(conversationHistory, toolUseId, toolUseResponse.error.data, conversationId);
      sendMessage({ type: 'auth_required' });
    } else {
      console.log("Tool use error", toolUseResponse.error);
      await addToolResultToHistory(conversationHistory, toolUseId, toolUseResponse.error.data, conversationId);
    }
  };

  /**
   * Handles a successful tool response
   * @param {Object} toolUseResponse - The response from the tool
   * @param {string} toolName - The name of the tool
   * @param {string} toolUseId - The ID of the tool use request
   * @param {Array} conversationHistory - The conversation history
   * @param {Array} productsToDisplay - Array to add product results to
   * @param {string} conversationId - The conversation ID
   */
  const handleToolSuccess = async (toolUseResponse, toolName, toolUseId, conversationHistory, productsToDisplay, conversationId) => {
    // Check if this is a product search result
    if (toolName === AppConfig.tools.productSearchName) {
      // productsToDisplay.push(...processProductSearchResult(toolUseResponse));


      // productsToDisplay.push(...processProductSearchResult(toolUseResponse, toolUseResponse.query));

      const newProducts =
          processProductSearchResult(toolUseResponse);

        newProducts.forEach(product => {
          const exists = productsToDisplay.some(
            p => p.id === product.id
          );

          if (!exists) {
            productsToDisplay.push(product);
          }
        });
      
    }

    console.log(
      "PRODUCTS TO DISPLAY",
      productsToDisplay
    );

    addToolResultToHistory(conversationHistory, toolUseId, toolUseResponse.content, conversationId);
  };

  /**
   * Processes product search results
   * @param {Object} toolUseResponse - The response from the tool
   * @returns {Array} Processed product data
   */
    const processProductSearchResult = (toolUseResponse) => {
        try {
          console.log("Processing product search result");
          let products = [];

          if (toolUseResponse.content && toolUseResponse.content.length > 0) {
            const content = toolUseResponse.content[0].text;

            try {
              let responseData;
              if (typeof content === 'object') {
                responseData = content;
              } else if (typeof content === 'string') {
                responseData = JSON.parse(content);
              }

              if (responseData?.products && Array.isArray(responseData.products)) {
                products = responseData.products
                  .slice(0, AppConfig.tools.maxProductsToDisplay)
                  .map(formatProductData);

                console.log(`Found ${products.length} products to display`);
              }
            } catch (e) {
              console.error("Error parsing product data:", e);
            }
          }

          return products;
        } catch (error) {
          console.error("Error processing product search results:", error);
          return [];
        }
      };

  /**
   * Formats a product data object
   * @param {Object} product - Raw product data
   * @returns {Object} Formatted product data
   */
  const formatProductData = (product) => {
    let price = 'Price not available';
    console.log(
      "Raw Product:",
      JSON.stringify(product, null, 2)
    );
   
    if (
      product.variants &&
      product.variants.length > 0 &&
      product.variants[0].price
    ) {

      const variantPrice =
        product.variants[0].price;

      if (
        typeof variantPrice === 'object'
      ) {

        price =
          `${variantPrice.currency} ${(variantPrice.amount / 100).toFixed(2)}`;

      } else {

        price = variantPrice;

      }
    }

 
    let imageUrl = '';

    if (product.image_url) {

      imageUrl = product.image_url;

    }
    else if (
      product.variants &&
      product.variants[0] &&
      product.variants[0].media &&
      product.variants[0].media[0]
    ) {

      imageUrl =
        product.variants[0].media[0].url;

    }


    return {
      id: product.id,
      title: product.title,
      price,
      image_url: imageUrl,
      description: product.description,
      url: product.url,

      variants: product.variants || [],

      subscriptionAvailable: product.selling_plans?.length > 0,

      sellingPlans: product.selling_plans || [],

      addToCartUrl: product.add_to_cart_url || null,
      tags: product.tags || []
    };



  };

  /**
   * Adds a tool result to the conversation history
   * @param {Array} conversationHistory - The conversation history
   * @param {string} toolUseId - The ID of the tool use request
   * @param {string} content - The content of the tool result
   * @param {string} conversationId - The conversation ID
   */
  const addToolResultToHistory = async (conversationHistory, toolUseId, content, conversationId) => {
    const toolResultMessage = {
      role: 'user',
      content: [{
        type: "tool_result",
        tool_use_id: toolUseId,
        content: content
      }]
    };

    // Add to in-memory history
    conversationHistory.push(toolResultMessage);

    // Save to database with special format to indicate tool result
    if (conversationId) {
      try {
        await saveMessage(conversationId, 'user', JSON.stringify(toolResultMessage.content));
      } catch (error) {
        console.error('Error saving tool result to database:', error);
      }
    }
  };

  return {
    handleToolError,
    handleToolSuccess,
    processProductSearchResult,
    addToolResultToHistory
  };
}

export default {
  createToolService
};