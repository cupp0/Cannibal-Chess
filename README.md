In **Cannibal Chess**, you can capture your own pieces. If you do, the resulting piece has the combined abilities of both pieces. For example, if you capture your own Bishop with a Rook, the resulting piece has the same abilites as a Queen! The goal remains the same as in Chess: capture the enemy King.

**Caveats**:
- The **King** may not combine with any other piece.
- **Castling** rules apply so long as the relevant Rook has not combined with anything.
- **En Passant** rules apply so long as neither pawn (passing or capturing) has combined with anything.
- **Pawn promotion** rules apply so long as the relevant Pawn has not combined with anything.
- No **check/checkmate** - eat the King.

**T0d0**
- castling, en passant, promotions
- art
- timer
- other UI stuff (menu, endscreen, flip board button)
- online matchmaking (maybe Omar makes a template?)

Here are all possible pieces.
- q
- qr    * 
- qb    * 
- qn
- qp    *
- qrb   * 
- qrn   * 
- qrp   *
- qbn   *
- qbp   *
- qnp   *
- qrbn  * 
- qrbp  * 
- qrnp  *
- qbnp  *
- qrbnp * 

- r
- rb    *
- rbn   *
- rbnp  *
- rbp   *
- rn
- rnp
- rp

- b
- bn
- bnp
- bp

- n
- np

- p

* the ability of this piece is already covered by another piece. For instance, a Queen has the same abilities as a RookBishop. When a Rook combines with a Bishop, should we promote the piece to a Queen? Or consider it as a RookBishop. Another variant could allow combined pieces to separate. In that case, we would certainly leave it as a RookBishop... I think it's more fun to consider them not as promoting to a new piece, but as combining. Continuity is good (seeing a RookBishop reminds them of how they combined as opposed to just seeing an extra Queen), and more Frankenpieces = more fun.
