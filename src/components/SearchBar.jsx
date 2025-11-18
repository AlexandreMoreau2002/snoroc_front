import PropTypes from 'prop-types'

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Rechercher',
  className,
}) {
  const classes = ['search-bar', className].filter(Boolean).join(' ')
  const handleChange = (event) => {
    onChange?.(event.target.value)
  }
  const handleClear = () => {
    onChange?.('')
  }

  return (
    <label className={classes}>
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />
      <div className="search-bar__actions">
        {value && (
          <button
            type="button"
            className="search-bar__clear"
            onClick={handleClear}
            aria-label="Effacer la recherche"
          >
            ×
          </button>
        )}
        <span className="search-bar__icon" aria-hidden>
          🔍
        </span>
      </div>
    </label>
  )
}

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
}
