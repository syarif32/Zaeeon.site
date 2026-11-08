import Breakline from "@/common/components/elements/Breakline";

import ContactList from "./ContactList";
import ContactForm from "./ContactForm";
import DigitalContactCard from "./DigitalContactCard";
const Contact = () => {
  return (
    <>
      <ContactList />
      <Breakline className="my-6" />
      <DigitalContactCard />
      <Breakline className="my-6" />
      <ContactForm />
    </>
  );
};

export default Contact;
