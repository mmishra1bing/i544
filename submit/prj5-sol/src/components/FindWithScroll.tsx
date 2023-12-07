// FindWithScroll.tsx
import React from 'react';

interface SensorResultsProps {
  results: Record<string, string>[];
}

const SensorResults: React.FC<SensorResultsProps> = ({ results }) => {
  if (results.length === 0) {
    return <p>No results found.</p>;
  }

return (
    <ul className="results">
      {results.map((result, index) => (
        <ul key={index} className="result">
          <dl>
            {Object.entries(result).map(([key, value]) => (
              <React.Fragment key={key}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </React.Fragment>
            ))}
          </dl>
        </ul>
      ))}
    </ul>
  );
};

type ScrollProps = {
  prevLink?: string;
  nextLink?: string;
  onPrevClick: () => void;
  onNextClick: () => void;
};

const Scroll: React.FC<ScrollProps> = ({ prevLink, nextLink, onPrevClick, onNextClick }) => {
  return (
    <div className="scroll">
      {prevLink && <a rel="prev" href="#" onClick={onPrevClick}>&lt;&lt;</a>}
      {nextLink && <a rel="next" href="#" onClick={onNextClick}>&gt;&gt;</a>}
    </div>
  );
};

interface FindWithScrollProps {
  results: Record<string, string>[];
  prevLink?: string;
  nextLink?: string;
  onPrevClick: () => void;
  onNextClick: () => void;
}

const FindWithScroll: React.FC<FindWithScrollProps> = ({
  results,
  prevLink,
  nextLink,
  onPrevClick,
  onNextClick,
}) => {
  return (
    <div>
      <Scroll prevLink={prevLink} nextLink={nextLink} onPrevClick={onPrevClick} onNextClick={onNextClick} />
      <SensorResults results={results} />
      <Scroll prevLink={prevLink} nextLink={nextLink} onPrevClick={onPrevClick} onNextClick={onNextClick} />
    </div>
  );
};

export default FindWithScroll;
