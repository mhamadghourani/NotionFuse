import SideBar from "@/components/sidebar/SideBar";
import "./globals.css";
import Nav from "@/components/navigation/Nav";

export default function Home() {
  return (
   <div className="dashboard">
    <Nav />
    <SideBar />
    <div className="content">content</div>
   </div>
  );
}
