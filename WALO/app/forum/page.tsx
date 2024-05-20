"use client";
import Header from "./components/Header/header";
import Footer from "@/components/Footer/Footer";
import CardGrid from './components/Blog/swiper.js';
import Rectangle from './components/Blog/Rectangle.jpg';

const cards = [
    { title: 'The 5 new startups launching this week', imageUrl: Rectangle.src, dateAdded: "11 February, 2024", timeToRead: "5", id: 1 },
    { title: 'The 5 new startups launching this week', imageUrl: Rectangle.src, dateAdded: "11 February, 2024", timeToRead: "5", id: 2 },
    { title: 'The 5 new startups launching this week', imageUrl: Rectangle.src, dateAdded: "11 February, 2024", timeToRead: "5", id: 3 },
    { title: 'The 5 new startups launching this week', imageUrl: Rectangle.src, dateAdded: "11 February, 2024", timeToRead: "5", id: 4 },
    { title: 'Card 5', imageUrl: Rectangle.src , dateAdded: "11 February, 2024", timeToRead: "5", id: 5 },
    { title: 'Card 6', imageUrl: Rectangle.src , dateAdded: "11 February, 2024", timeToRead: "5", id: 6 },
    { title: 'Card 7', imageUrl: Rectangle.src , dateAdded: "11 February, 2024", timeToRead: "5", id: 7 },
    { title: 'Card 8', imageUrl: Rectangle.src , dateAdded: "11 February, 2024", timeToRead: "5", id: 8 },
    { title: 'Card 9', imageUrl: Rectangle.src , dateAdded: "11 February, 2024", timeToRead: "5", id: 9 },
    { title: 'Card 10', imageUrl: Rectangle.src , dateAdded: "11 February, 2024", timeToRead: "5", id: 10 },
    { title: 'Card 11', imageUrl: Rectangle.src , dateAdded: "11 February, 2024", timeToRead: "5", id: 11 },
    { title: 'Card 12', imageUrl: Rectangle.src , dateAdded: "11 February, 2024", timeToRead: "5", id: 12 },
    { title: 'Card 13', imageUrl: Rectangle.src , dateAdded: "11 February, 2024", timeToRead: "5", id: 13 },
    { title: 'Card 14', imageUrl: Rectangle.src , dateAdded: "11 February, 2024", timeToRead: "5", id: 14 },
    { title: 'Card 15', imageUrl: Rectangle.src , dateAdded: "11 February, 2024", timeToRead: "5", id: 15 },
    { title: 'Card 16', imageUrl: Rectangle.src , dateAdded: "11 February, 2024", timeToRead: "5", id: 16 },
    { title: 'Card 17', imageUrl: Rectangle.src , dateAdded: "11 February, 2024", timeToRead: "5", id: 17 },
    { title: 'Card 18', imageUrl: Rectangle.src , dateAdded: "11 February, 2024", timeToRead: "5", id: 18 },
    { title: 'Card 19', imageUrl: Rectangle.src , dateAdded: "11 February, 2024", timeToRead: "5", id: 19 },
    { title: 'Card 20', imageUrl: Rectangle.src , dateAdded: "11 February, 2024", timeToRead: "5", id: 20 },
    
  ];
export default function forum() {
return (
    <main>
        <Header />
        <br></br>
        <CardGrid cards={cards} />
        <br></br>
        <Footer />
    </main>
);
}