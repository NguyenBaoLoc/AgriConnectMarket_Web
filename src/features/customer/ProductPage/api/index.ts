import axios from "axios";
import { API } from "../../../../api";
import type { GetProductListResponse, Product } from "../types";

export async function getProductList(): Promise<GetProductListResponse> {
  try {
    const products: Product[] = [
      // Fruits
      {
        id: "1",
        name: "Organic Strawberries",
        price: 4.99,
        unit: "Per lb",
        image:
          "https://images.unsplash.com/photo-1565032156168-0a22e5b8374f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHN0cmF3YmVycmllc3xlbnwxfHx8fDE3NTk5NTE4OTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        badge: "Fresh",
        category: "fruits",
      },
      {
        id: "2",
        name: "Ripe Bananas",
        price: 2.49,
        unit: "Per bunch",
        image:
          "https://images.unsplash.com/photo-1680165528445-acee3470f012?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaXBlJTIwYmFuYW5hc3xlbnwxfHx8fDE3NTk5ODY2ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "fruits",
      },
      {
        id: "3",
        name: "Fresh Oranges",
        price: 3.99,
        unit: "Per lb",
        image:
          "https://images.unsplash.com/photo-1757283961709-1087406a5df1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMG9yYW5nZXMlMjBjaXRydXN8ZW58MXx8fHwxNzU5OTYwMjk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        badge: "Popular",
        category: "fruits",
      },
      {
        id: "4",
        name: "Fresh Apples",
        price: 3.49,
        unit: "Per lb",
        image:
          "https://images.unsplash.com/photo-1623815242959-fb20354f9b8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGFwcGxlc3xlbnwxfHx8fDE3NjA0NDgxOTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "fruits",
      },
      {
        id: "5",
        name: "Blueberries",
        price: 5.99,
        unit: "Per pack",
        image:
          "https://images.unsplash.com/photo-1584459853781-6e4ed51deebf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVlYmVycmllcyUyMGZyZXNofGVufDF8fHx8MTc2MDQ4MTI1MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        badge: "Organic",
        category: "fruits",
      },
      {
        id: "6",
        name: "Watermelon",
        price: 6.99,
        unit: "Each",
        image:
          "https://images.unsplash.com/photo-1629265824943-b0a19b32c7a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlcm1lbG9uJTIwc2xpY2VkfGVufDF8fHx8MTc2MDQ4MTI1Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "fruits",
      },
      {
        id: "7",
        name: "Fresh Pineapple",
        price: 4.49,
        unit: "Each",
        image:
          "https://images.unsplash.com/photo-1632242342964-242876b950c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHBpbmVhcHBsZXxlbnwxfHx8fDE3NjA0ODEyNTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "fruits",
      },
      {
        id: "8",
        name: "Ripe Mango",
        price: 2.99,
        unit: "Each",
        image:
          "https://images.unsplash.com/photo-1734163075572-8948e799e42c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW5nbyUyMGZyZXNofGVufDF8fHx8MTc2MDQ4MTI1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "fruits",
      },
      {
        id: "9",
        name: "Green Grapes",
        price: 4.29,
        unit: "Per lb",
        image:
          "https://images.unsplash.com/photo-1596363505729-4190a9506133?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwZXMlMjBmcmVzaHxlbnwxfHx8fDE3NjA0ODEyNTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        badge: "Fresh",
        category: "fruits",
      },
      // Vegetables
      {
        id: "10",
        name: "Organic Tomatoes",
        price: 3.49,
        unit: "Per lb",
        image:
          "https://images.unsplash.com/photo-1630172821918-1df2441fb327?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjB0b21hdG9lc3xlbnwxfHx8fDE3NTk5NzUzMTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        badge: "Organic",
        category: "vegetables",
      },
      {
        id: "11",
        name: "Fresh Carrots",
        price: 2.99,
        unit: "Per bunch",
        image:
          "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGNhcnJvdHN8ZW58MXx8fHwxNzU5OTIwNDk2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "vegetables",
      },
      {
        id: "12",
        name: "Bell Peppers",
        price: 4.49,
        unit: "Per lb",
        image:
          "https://images.unsplash.com/photo-1509377244-b9820f59c12f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWxsJTIwcGVwcGVycyUyMGNvbG9yZnVsfGVufDF8fHx8MTc1OTk4NjY4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        badge: "Colorful",
        category: "vegetables",
      },
      {
        id: "13",
        name: "Fresh Broccoli",
        price: 3.29,
        unit: "Per head",
        image:
          "https://images.unsplash.com/photo-1757332334626-8dadb145540d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm9jY29saSUyMGZyZXNofGVufDF8fHx8MTc2MDQ4MTI1NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "vegetables",
      },
      {
        id: "14",
        name: "Cucumber",
        price: 1.99,
        unit: "Each",
        image:
          "https://images.unsplash.com/photo-1676043967433-f2a9f6d8e9b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdWN1bWJlciUyMGdyZWVufGVufDF8fHx8MTc2MDQ4MTI1NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "vegetables",
      },
      {
        id: "15",
        name: "Zucchini",
        price: 2.79,
        unit: "Per lb",
        image:
          "https://images.unsplash.com/photo-1598962099619-528a224cb625?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx6dWNjaGluaSUyMGZyZXNofGVufDF8fHx8MTc2MDQ4MTI1NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "vegetables",
      },
      {
        id: "16",
        name: "Red Onions",
        price: 2.49,
        unit: "Per lb",
        image:
          "https://images.unsplash.com/photo-1621295213070-e7c9c89972af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmlvbnMlMjBmcmVzaHxlbnwxfHx8fDE3NjAzODY3NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "vegetables",
      },
      {
        id: "17",
        name: "Fresh Garlic",
        price: 1.99,
        unit: "Per bulb",
        image:
          "https://images.unsplash.com/photo-1652209766128-4beb2d6bc903?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJsaWMlMjBidWxic3xlbnwxfHx8fDE3NjAzODI3NTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "vegetables",
      },
      {
        id: "18",
        name: "Green Cabbage",
        price: 2.29,
        unit: "Per head",
        image:
          "https://images.unsplash.com/photo-1587096677895-52478b441d9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWJiYWdlJTIwZnJlc2h8ZW58MXx8fHwxNzYwNDgxMjU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "vegetables",
      },
      // Leafy Greens
      {
        id: "19",
        name: "Fresh Spinach",
        price: 3.29,
        unit: "Per bunch",
        image:
          "https://images.unsplash.com/photo-1683536905403-ea18a3176d29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHNwaW5hY2h8ZW58MXx8fHwxNzU5OTg2Njg0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        badge: "Fresh",
        category: "leafy-greens",
      },
      {
        id: "20",
        name: "Green Lettuce",
        price: 2.79,
        unit: "Per head",
        image:
          "https://images.unsplash.com/photo-1657411658285-2742c4c5ed1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZXR0dWNlJTIwZ3JlZW58ZW58MXx8fHwxNzU5OTg2Njg0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "leafy-greens",
      },
      {
        id: "21",
        name: "Organic Kale",
        price: 3.99,
        unit: "Per bunch",
        image:
          "https://images.unsplash.com/photo-1757466687626-613680476e5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrYWxlJTIwbGVhdmVzfGVufDF8fHx8MTc1OTkyMDQ5NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        badge: "Organic",
        category: "leafy-greens",
      },
      {
        id: "22",
        name: "Arugula",
        price: 3.49,
        unit: "Per pack",
        image:
          "https://images.unsplash.com/photo-1635180649124-73a6b8e1a384?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnVndWxhJTIwbGVhdmVzfGVufDF8fHx8MTc2MDQ4MTI1N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "leafy-greens",
      },
      {
        id: "23",
        name: "Rainbow Chard",
        price: 3.79,
        unit: "Per bunch",
        image:
          "https://images.unsplash.com/photo-1714425397620-7891bc733daa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGFyZCUyMGxlYXZlc3xlbnwxfHx8fDE3NjA0ODEyNTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "leafy-greens",
      },
      {
        id: "24",
        name: "Fresh Basil",
        price: 2.99,
        unit: "Per bunch",
        image:
          "https://images.unsplash.com/photo-1662422325326-19089df23d98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJicyUyMGZyZXNoJTIwYmFzaWx8ZW58MXx8fHwxNzYwNDgxMjU4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        badge: "Fresh",
        category: "leafy-greens",
      },
      {
        id: "25",
        name: "Collard Greens",
        price: 3.29,
        unit: "Per bunch",
        image:
          "https://images.unsplash.com/photo-1559852925-6a5a7125525b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsYXJkJTIwZ3JlZW5zfGVufDF8fHx8MTc2MDQ4MTI1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "leafy-greens",
      },
    ];
    return {
      success: true,
      message: "Products fetched successfully",
      data: products,
    };
    // const url = API.products.list;
    // const response = await axios.get<GetProductListResponse>(url);
    // const responseData = response.data;
    // return responseData;
  } catch (error: any) {
    if (error.response?.status === 400) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}
