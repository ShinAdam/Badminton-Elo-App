import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { FaCodeBranch, FaEnvelope, FaGithub } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer bg-light">
      <Container>
        <Row className="justify-content-center">
          <Col className="d-flex justify-content-center">
            <a href="https://github.com/ShinAdam" target="_blank" rel="noopener noreferrer" className="footer-icon me-3">
              <FaGithub />
            </a>
            <a href="mailto:adamshin19@gmail.com" className="footer-icon">
              <FaEnvelope />
            </a>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col className="d-flex justify-content-center">
            <a href="https://github.com/ShinAdam/Badminton-Elo-App" target="_blank" rel="noopener noreferrer" className="footer-repo">
                <FaCodeBranch /> Source Code
            </a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
