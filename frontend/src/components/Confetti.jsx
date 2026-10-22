/**
 * Confetti Component - Kutlama Animasyonu
 * Görev tamamlandığında konfeti patlatır
 */
import { useEffect, useState } from 'react';
import './Confetti.css';

function Confetti({ trigger, duration = 3000 }) {
  const [particles, setParticles] = useState([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      // 50 konfeti parçası oluştur
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        animationDuration: 2 + Math.random() * 2,
        size: 5 + Math.random() * 10,
        color: [
          '#667eea',
          '#764ba2',
          '#f093fb',
          '#ffd700',
          '#ff6b81',
          '#4ecdc4',
          '#45b7d1'
        ][Math.floor(Math.random() * 7)]
      }));

      setParticles(newParticles);
      setShow(true);

      setTimeout(() => setShow(false), duration);
    }
  }, [trigger, duration]);

  if (!show) return null;

  return (
    <div className="confetti-container">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="confetti-particle"
          style={{
            left: `${particle.left}%`,
            animationDuration: `${particle.animationDuration}s`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color
          }}
        />
      ))}
    </div>
  );
}

export default Confetti;
