import { useSiteImage } from '../../hooks/useSiteImage'

export default function AboutPage() {
  const aboutImage = useSiteImage('about_image')

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1
        className="mb-8"
        style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--char-blue)' }}
      >
        About
      </h1>

      {aboutImage && (
        <div className="w-full rounded overflow-hidden mb-8">
          <img src={aboutImage} alt="about" className="w-full object-cover block" />
        </div>
      )}

      <div className="space-y-2">
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
            color: 'var(--char-blue)',
            letterSpacing: '0.04em',
          }}
        >
          블랙 파마코피아
        </h2>
        <p
          className="opacity-70"
          style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', color: 'var(--char-blue)' }}
        >
          우리엘 &times; 어니스트 칼더
        </p>
      </div>
    </div>
  )
}
