import React from 'react';

export function DefaultElement(props: {
  attributes: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
  children: React.ReactNode;
}): JSX.Element {
  return <p {...props.attributes}>{props.children}</p>;
}
