export function StateBlock({
  title,
  message,
  tone = 'neutral',
  action,
}) {
  return (
    <div className={`state-block state-${tone}`}>
      <h3>{title}</h3>
      <p>{message}</p>
      {action ? (
        <a className="button button-secondary" href={action.href}>
          {action.label}
        </a>
      ) : null}
    </div>
  )
}
